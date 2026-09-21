# ⚡ Neon Survivors ⚡

A Vampire Survivors-style game built with plain HTML, CSS, and JavaScript. Survive hordes of enemies, collect XP, upgrade your powers, and defeat bosses!

## 🎮 How to Play

- **Play online:** <a href="https://dliedke.github.io/NeonSurvivors/neon-survivors.html" target="_blank" rel="noopener noreferrer">Open Neon Survivors</a>

Open `neon-survivors.html` in any modern browser. No installation required!

The game automatically selects **English or Portuguese** using your browser's language preferences. Regional variants such as `en-US`, `en-GB`, `pt-BR`, and `pt-PT` are supported. The first supported language in your preference list is used; if none is supported, the game defaults to English. Reload the page after changing your browser's preferred languages.

### 🎯 Best Experience

**💡 RECOMMENDED:** Play on a PC with a controller (Xbox/PlayStation) for the best gameplay experience!

The game automatically enters **fullscreen** when you start (press ESC or F11 to exit).

### Controls

| Action | Keyboard | Controller | Mobile |
|--------|----------|------------|--------|
| Move | `WASD` or `Arrow keys` | Left stick | 🕹️ Virtual joystick |
| Pause | `P` or `ESC` | - | ⏸️ button |
| Fullscreen | `F` or `F11` | - | Automatic |
| Adjust difficulty | `+` / `-` | 🔼 / 🟥 | Tap the THREAT bar |
| Select/Confirm | - | 🅰️ A button | Tap buttons |
| Navigate upgrades | - | ⬅️ ➡️ D-pad | Tap an upgrade |
| Toggle music | `M` or ♫ button | - | ♫ button |
| Next track | ⏭ button | - | ⏭ button |
| Effects volume / mute | SOUND menu | - | SOUND menu |

### 📱 Mobile Support

The game automatically detects touch devices and displays:
- **Virtual joystick** in the bottom-left corner for movement
- **Touch-friendly threat bar** — tap the desired position directly
- **Optimized controls** — reduced movement speed for better control
- **Automatic fullscreen** when starting and resuming

## ✨ Features

### 🎯 Combat System
- **Automatic attacks** — Target the nearest enemies
- **Critical hits** — Chance to deal 2x damage
- **Lifesteal** — Recover health by killing enemies
- **Explosions** — Enemies explode on death, dealing area damage

### ⬆️ Permanent Upgrades (18 Types)
- ⚔️ **Damage** — More damage per shot
- 🔫 **Fire Rate** — Shoot faster
- 🎯 **Projectiles** — +2 simultaneous projectiles
- 💨 **Speed** — Move faster (disabled on mobile)
- ❤️ **Health** — Increase maximum health
- 🧲 **Magnet** — Collect XP from farther away
- 🚀 **Fast Shots** — Faster projectiles
- 💚 **Regeneration** — Recover health over time
- 🔥 **Piercing** — Projectiles pass through enemies
- 🧛 **Lifesteal** — +3 HP per kill; a healing pool of 8% of maximum health replenishes every second to keep hordes challenging
- ⚡ **Multi-Hit** — Projectiles ricochet
- 💥 **Explosion** — Enemies explode on death
- 🎯 **Critical Hit** — 15% chance to deal 2x damage
- 🧲 **XP++** — Orbs grant 20% more XP
- 🛰️ **Orbital Drones** — Two drones deal contact damage; each upgrade adds a drone and increases damage
- 🌩️ **Chain Lightning** — Automatic discharges jump between nearby enemies
- ❄️ **Frost Pulse** — An area wave damages enemies and slows them for 2.2 seconds
- ☄️ **Meteors** — Mark targets and bombard the area after a brief visual warning

The four new powers can be upgraded to level 5. One of these powers appears in every upgrade selection while upgrades remain available. Kills from all powers count toward XP, combos, waves, and lifesteal.

### 👹 Enemies and Bosses
- **10 enemy types** with unique characteristics:
  - 🔴 Small and fast (2 XP)
  - 🟠 Medium and tough (4 XP)
  - 🟡 Fast and fragile (2 XP)
  - 🔵 Slow tank (5 XP)
  - 🟣 Fast elite (2 XP)
  - 🔷 Balanced medium enemy (2 XP)
  - 🎯 Sentry — Keeps its distance, locks its aim, and fires after a warning (4 XP)
  - 🔥 Artillery — Fires three shots in a fan, with their trajectories shown in advance (5 XP)
  - ⚡ Charger — Prepares a fast charge in a fixed direction; dodge after its aim locks (3 XP)
  - 💣 Bomber — Marks an area before an explosion; leave the red circle (6 XP)
- Special enemies arrive after 18 seconds; at 300% threat or higher, they can appear from the start
- Enemy shots are orange diamonds, distinct from the player's green projectiles. Shields block damage; time freeze stops shots, attack preparations, and explosions; bombs clear projectiles and hazardous areas
- **Bosses** — Appear every 45 seconds
  - Size capped at 90px (they won't get too huge!)
  - Damage and health increase with time and the selected threat level
  - Fire rings of projectiles after a visual warning; boss numbering advances even if the previous boss is still alive

### 💎 Power-ups

**Large Treasures** (appear every 15–25 seconds):
- 💣 **Explosion** — Kills all enemies on screen
- 🛡️ **Shield** — Invincibility for 8 seconds
- 💖 **Full Heal** — Restores 100% health
- 🔥 **Fury** — 3x damage for 10 seconds
- 🌀 **Projectiles** — +5 projectiles for 15 seconds
- ⏳ **Time Freeze** — Freezes enemies for 6 seconds; bosses are greatly slowed

**Mini Power-ups** (appear every 8–12 seconds):
- 💎 **+XP** — Instantly gain 30 XP
- ⚡ **Rapid Fire** — Increased fire rate for 5 seconds
- 🌟 **Star** — Halves all enemies' health
- 💰 **Coins** — Spawns 5 XP orbs
- 🧲 **Global Magnet** — Attracts all XP in the arena for 6 seconds

Temporary bonuses stop counting down while paused and are cleared on restart. Their remaining duration appears above the XP bar.

### 🔥 Combo System (UNLIMITED!)
- Kill nearby enemies (< 350px) to build your combo
- A 6-second timer keeps the combo active; afterward, the combo halves every 2.5 seconds
- **Unlimited multiplier**: 1.5x → 2x → 2.5x → 3x → ...
- Progression: +0.5x every 3 consecutive kills
- **No maximum limit!** Build epic combos for massive XP

### 🌊 Wave System
- Complete waves by killing enemies
- Gain +15 HP after each wave
- **Special events every 3 waves**:
  - ⚡ **HORDE!** — A burst of enemies proportional to the spawn setting
  - ⚡ **ELITE!** — 3 powerful enemies appear
  - ⚡ **XP RAIN!** — 30 XP orbs across the screen
  - 🎁 **EXTRA ARSENAL!** — Two treasures appear in the arena

### 🎯 In-game Challenges

The first warning appears at 25 seconds, with 3 seconds to prepare. Challenges last 18–20 seconds and alternate between:

- **Crossfire** — Sentry and artillery reinforcements
- **Siege Zone** — Bombers, tanks, and impact zones marked on the ground
- **The Hunt** — Chargers and fast enemies force you to change direction

Surviving awards +10 HP and a treasure. The next warning arrives after a 30-second break. Reinforcement counts scale with threat, and all timers stop during pauses and upgrade selection.

### 🎨 Neon Arena

- Three-layer parallax arena: distant rings, circuits, and particles, with ambient motion and a response to the pilot's movement
- Continuous motion across screen edges; respects pauses and reduced-motion preferences
- Pilot, ten enemy types, and bosses with distinct armor and silhouettes
- Projectile trails, XP crystals, shockwaves, and unique effects for each power
- Refreshed interface, upgrade cards, and controls adapted for small screens
- Cached scenery and sprites; capped particles and effects to keep hordes running smoothly

### 🎵 Neon Radio

Five original instrumental synthwave compositions, synthesized in the browser with drums, bass, chords, and melodies:

1. **Midnight Circuit** — 112 BPM
2. **Electric Bloom** — 124 BPM
3. **Afterglow Drive** — 104 BPM
4. **Plasma Rush** — 132 BPM
5. **Starlight Escape** — 118 BPM

The playlist shuffles all five tracks without repeating until the round is complete. Music starts when you play and follows pauses, upgrade selection, and game over. Use **M / ♫** to mute, **⏭** to skip, and the volume slider when visible; volume and mute preferences are saved in the browser. Music requires no audio downloads or external dependencies.

### 🎛️ Additional Features
- **Adjustable difficulty from 20% to 1000%** — The THREAT bar changes enemy counts; above 100%, it also increases the health, damage, and attack frequency of newly spawned enemies. Adjust with `+` / `-`, a controller, mouse, or touch; when the bar is focused, use the arrow keys, `Home`, and `End`
- **Progressive pressure** — Enemies gain health throughout the run, with speed and entity limits to preserve room for dodging and maintain performance
- **Balanced level progression** — Reduced multiplier (1.35x) and increased enemy XP
- **Softer sounds** — Sine and triangle tones, a high-frequency filter, smooth fades, and compression; frequent effects have a minimum interval and a simultaneous voice limit
- **Independent effects volume** — Starts at 28%; adjust or mute in the **SOUND** menu, including on mobile. Preferences are saved in the browser separately from music
- **Screen shake** — Visual feedback when taking damage
- **Automatic fullscreen** — Enters fullscreen when starting
- **Pause on tab switch** — Protects your run and bonuses while the game is in the background
- **Browser language detection** — English and Portuguese menus, instructions, upgrades, challenges, and accessibility labels
- **Embedded page icon** — A neon lightning favicon included in the HTML file

## 🏆 Tips

1. **Play on a PC with a controller** — Best gameplay experience!
2. **Keep moving** — Standing still means death!
3. **Maintain your combo** — Kill nearby enemies for an UNLIMITED XP multiplier
4. **Prioritize projectile upgrades** — More projectiles = more kills
5. **Grab mini power-ups** — They appear frequently and help a lot
6. **Watch out for bosses** — They deal much more damage!
7. **Take advantage of special events** — Events every 3 waves bring unique opportunities
8. **Lifesteal + Explosion** — A powerful survival combination
9. **XP++ + High Combo** — Maximize your experience gains

## 🛠️ Technologies

- **HTML5 Canvas** — Game rendering
- **CSS3** — Interface and visual effects
- **Vanilla JavaScript** — Game logic (a single file!)
- **Web Audio API** — Procedural sound
- **Gamepad API** — Controller support
- **Fullscreen API** — Automatic fullscreen

## 📁 Structure

```
neon-survivors.html    # Single file containing the entire game, translations, and icon
README.md              # This file
tests/gameplay.test.cjs # Combat, difficulty, challenge, audio, parallax, and language regression tests
```

To run the logic tests with Node.js installed: `node --test tests/gameplay.test.cjs`. The game still runs directly from the HTML file without installing packages.

## 🎨 Credits

Developed by [dliedke](https://github.com/dliedke).

---

**Have fun! 🎮**
