# CLAUDE.md - Neon Survivors

## Project Overview

Vampire Survivors-style arena shooter shipped as one self-contained HTML file: canvas rendering, vanilla JavaScript, Web Audio (every sound and all music synthesized in the browser), Gamepad API, touch controls, and English/Portuguese localization.

- Author: dliedke (Daniel Carvalho Liedke)
- Repository: https://github.com/dliedke/NeonSurvivors (branch `main`)
- Live: https://dliedke.github.io/NeonSurvivors/neon-survivors.html. GitHub Pages serves the repo root of `main`, so every push to `main` publishes the game.

No build step, no npm packages, no bundler. The only external request is the Google Fonts `@import` (Orbitron, Press Start 2P); offline, the game falls back to system fonts.

## Run & Test

```bash
node --test tests/gameplay.test.cjs   # Logic regression suite: Node built-in runner, zero dependencies, runs in under a second
dotnet run                            # Local host at http://localhost:5080 (same as F5 in Visual Studio; builds first)
```

- Opening `neon-survivors.html` directly in a browser also works: the file itself is the deliverable.
- The .NET host (`Program.cs`, net10.0) serves the copy of the HTML in the build output, not the source file. Restart `dotnet run` (it rebuilds) after editing, or you are testing a stale copy.
- The suite covers game logic only. Rendering, CSS, audio output, fullscreen, gamepad and touch need a manual check in a browser (device emulation for touch).
- Gameplay changes come with a regression test in `tests/gameplay.test.cjs`.

## Files

```
neon-survivors.html             # The entire game: CSS, HUD markup, translations, script, inline SVG favicon
tests/gameplay.test.cjs         # node:test suite; runs the game script in a vm sandbox with DOM stubs
README.md                       # Player docs: mechanics with exact numbers, controls table
Program.cs                      # Minimal ASP.NET Core host: GET / and /neon-survivors.html return the HTML
NeonSurvivors.csproj            # Web SDK, net10.0, EnableDefaultContentItems=false, HTML is the only Content item
NeonSurvivors.slnx              # Visual Studio solution
Properties/launchSettings.json  # http://localhost:5080
```

Keep `neon-survivors.html` at the repo root under this name: the Pages URL, `Program.cs`, the csproj and the tests all reference it.

## Test Harness Constraints

`tests/gameplay.test.cjs` pulls the first `<script>…</script>` block out with a regex, runs it via `vm.runInContext` against hand-written stubs, then drives the game by calling functions and reassigning globals by name (`update(16)`, `enemies = [...]`, `audioCtx = {...}`, `scheduleMusicStep = () => {}`). Therefore:

- Keep exactly one inline `<script>` with no attributes (no `type="module"`, no `src`, no other script before it).
- Keep game state as top-level `let` bindings and functions as top-level function declarations. Wrapping the script in an IIFE/module/class, or turning a reassigned `let` into `const`, breaks the suite.
- Load-time code only sees the stubs in `createGame()`: `getElementById` (auto-creates elements), `createElement`, `querySelector('.class')` (exact `class` attribute match only), `querySelectorAll('[attr]')` only, `classList` with only `add`/`remove`/`toggle`, `getContext()` returning `{}`, no-op timers and `requestAnimationFrame`, `localStorage.getItem` returning `null`, `window` with only `innerWidth`/`innerHeight`/`addEventListener`/`matchMedia`, and no `screen` or `AudioContext`. Guard new load-time browser API use or extend the stubs, otherwise every test fails at load.
- The default test locale is `pt-BR`, so some assertions compare Portuguese strings (`'FOGO CRUZADO'`, `'Ímã Total'`).
- The harness calls `initGame()`, parks auto-fire and the boss/treasure/mini power-up timers at `Infinity`, and defines `testEnemy(x, y, health)`; tests spawn exactly what they need.

## Script Layout (`<script>`, top to bottom)

1. i18n: `translations`, `detectLanguage()`, `t()`, application of `data-i18n*` attributes
2. Canvas and resize, `shake()`, combo/wave globals (`COMBO_WINDOW`, `COMBO_DECAY_WINDOW`)
3. Audio: `initAudio()`; effects (`sfx`, `soundPalette`, `playSound()`); radio (`musicTracks`, `music`, `chooseMusicTrack()`, `scheduleMusicStep()`, `syncMusic()`)
4. State globals and caps (`MAX_ENEMIES`, `MAX_ENEMY_PROJECTILES`, `MIN_SPAWN`/`MAX_SPAWN`), touch tuning constants
5. Content tables: `allUpgrades` (18 permanent upgrades), `superPowers` (large treasures), `temporaryPowerups` (mini power-ups)
6. `initGame()` (resets every run-scoped value), HUD helpers, `adjustDifficulty()`, touch joystick and threat bar
7. Flow and input: `startGame()`, `togglePause()`, keyboard/visibility/blur handlers, gamepad polling (`checkGamepadButtons()`, every 100 ms), `handleUpgradeKey()`
8. Enemies: `enemyTypes` (array index = `variant`, as in `spawnEnemy(forcedVariant)`), `threatScaling()`, `spawnEnemy()`, `spawnBoss()`, `spawnTreasure()`
9. Combat: `shoot()`, `levelUp()`, `gameOver()`, `hitEnemy()`, `updateWeapons()` (drones, lightning, frost, meteors), `waveCompleted()`, `resolveDefeatedEnemies()`, `collectLevelUps()`, `hurtPlayer()`, `fireEnemyAttack()`, `updateEnemies()`, `updateEnemyAttacks()`, `challengeTypes` + `updateChallenges()`, `updateParallax()`
10. `update(deltaTime)`: one simulation step
11. Rendering: `actorSprite()` + `spriteCache`, cached arena/circuit textures, `drawEnemyWarnings()`, `draw()`
12. `gameLoop()` (requestAnimationFrame, delta capped at 50 ms), then load-time init

`<style>` holds base rules, then a `/* Neon arcade shell */` override layer, then the media queries. Check both layers before changing a style. Static markup text is the Portuguese fallback, replaced at load.

## Gameplay Invariants

- **One clock.** `game.time` (ms) advances only inside `update()` while `!game.paused` (pause menu, level-up screen, hidden tab). Buffs and cooldowns are absolute `game.time` timestamps (`player.shieldUntil`, `furyUntil`, `freezeUntil`, `lastMeteor`, `game.nextChallenge`); per-entity timers are countdowns decremented by `deltaTime` (`attackTimer`, `windupLeft`, hazard `remaining`, meteor `life`). Never use `setTimeout`/`Date.now()` for gameplay (`setTimeout` only hides HUD banners). This is what freezes buffs and challenges while paused.
- **Frame-rate independence.** Movement is `speed * frameScale` with `frameScale = deltaTime / (1000 / 60)`, so speeds are pixels per 60 fps frame.
- **Kills settle in one place.** Deal damage with `hitEnemy()` (it skips dead enemies). Never splice `enemies` or grant rewards inline: leave `health <= 0` and let `resolveDefeatedEnemies()` apply combo, wave progress, lifesteal budget, explosion-on-kill, XP drops and boss rewards. It loops until no new deaths remain, so explosion chains settle without recursion. `update()` calls it after weapons and projectiles; code that kills elsewhere must call it itself (the bomb treasure does).
- **Player damage** goes through `hurtPlayer()`: shield check plus 450 ms of invulnerability shared by all sources.
- **Enemy attacks are telegraphed.** `attackTimer` → `windupLeft` (movement and aim locked, warning drawn by `drawEnemyWarnings()`) → `fireEnemyAttack()`. Attacks only start while the shooter is on screen; time freeze stops windups, hostile projectiles and hazards. Player and hostile projectiles both use swept collision.
- **Threat** (`spawnMultiplier`, 0.2–10 = 20–1000%) scales the spawn rate proportionally (tested at 5x/10x within ±10%). Above 1.0 it also raises new enemies' health, damage and attack frequency through `threatScaling()`, which also grows with survival minutes.
- **Level-ups queue.** `collectLevelUps()` increments `game.pendingUpgrades`; each pick reopens `levelUp()` until the queue is empty. One `maxLevel` weapon (orbit, lightning, frost, meteor; max 5) is always offered while any remains, `projectile` gets a 40% offer boost, and `speed` is hidden on touch devices.
- **Performance caps.** Respect them when adding entities or effects: 320 enemies, 180 hostile projectiles, 650 particles, 90 damage numbers, 100 effects, 12 hazards, 16 trail points, 6 SFX voices (10 for `priority` sounds) plus a per-sound `gap` throttle. Sprites and background textures are cached; `resizeCanvas()` drops the arena texture.
- **Touch vs desktop** (`isTouchDevice`): touch moves at 0.7x speed with 0.2 joystick sensitivity, clamps to the screen edges instead of wrapping, hides the speed upgrade, shrinks hazards, slows enemy shots (0.8x) and shortens charger dashes. Check both branches when changing movement or attacks.
- **Desktop screen wrap.** Parallax integrates the actual travel before wrapping so the background never jumps.
- **Reduced motion** (`reducedMotion`) disables screen shake, parallax, background drift and the player trail; a CSS media query collapses animations.
- **Audio.** `initAudio()` creates the `AudioContext` lazily from a user gesture. Everything is synthesized (no audio files); keep effects on `sine`/`triangle` waves (the README promises soft tones). `syncMusic()` (polled every 25 ms, also called right after state changes) decides from `gameRunning`, `game.paused`, `document.hidden`, mute and volume whether the radio plays. Settings persist in `localStorage` (`neon-sfx`, `neon-radio`), always inside try/catch (private browsing).

## Localization

- Every user-visible string lives in `translations` as `{"en": ..., "pt": ...}` and is read with `t(key, { name })` (`{name}` placeholders). A missing key throws; a missing `pt` falls back to `en`.
- Static markup uses `data-i18n` (sets `innerHTML`, so trusted inline strings only), `data-i18n-aria-label` and `data-i18n-title`.
- The language is picked once at load (`en`/`pt`; `<html lang>` becomes `en`/`pt-BR`). Content tables call `t()` at load, so there is no runtime switching.
- Keep `aria-label`/`title` text localized when UI state toggles (see `updateMusicUI()`, `togglePause()`).

## Common Changes

| Change | Touch |
|--------|-------|
| Permanent upgrade | `allUpgrades` entry (`id`, `icon`, `apply`, optional `maxLevel`) + `<id>Name`/`<id>Desc` translations; README upgrade list and the "18" in README and `upgradeFeature` |
| Treasure / mini power-up | `superPowers` / `temporaryPowerups` entry; a timed one sets `player.<x>Until = game.time + ms`, resets it in `initGame()` and joins the buff list at the end of `draw()` |
| Enemy type | `enemyTypes` entry + spawn `weights` in `spawnEnemy()` (early list = basic chasers, unlocked list = all types) + the per-variant `sides` array in `actorSprite()`; a new behavior also needs `updateEnemies()`, `fireEnemyAttack()`, `drawEnemyWarnings()` |
| Arena challenge | `challengeTypes` entry (`variants`, `duration`) + name/hint translations; the siege hazards key off `variants[0] === 9` in `updateChallenges()` |
| Sound effect | `soundPalette` entry (`from`, `to`, `duration`, `gain`, `gap`, optional `wave`/`notes`/`priority`), then `playSound('<key>')` |
| Music track | `musicTracks` entry (`name`, `bpm`, MIDI `root`, 4 `chords`, 16-step `melody` with `-1` rests, `lead`, `swing`). The radio test, README and `trackCount` all assume exactly five tracks |

`README.md` states mechanics with exact numbers (timers, percentages, counts, XP values) and has a controls table; the start-screen pills and upgrade descriptions repeat some of them. When a number, control or piece of content changes, update code, `translations`, `README.md` and tests together.

## Code Style

- Vanilla modern JS (optional chaining, `??`), 4-space indent, semicolons, single quotes, compact one-line statements where readable. No frameworks, libraries or asset files: everything stays inside `neon-survivors.html`.
- `UPPER_SNAKE_CASE` constants, camelCase otherwise. Content is data-driven: tables of plain objects with `apply()` functions.
- Some older comments are in Portuguese; write new ones in English.
- Commits: Conventional Commits (`feat: ...`, `fix: ...`).
