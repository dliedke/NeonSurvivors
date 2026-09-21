// Run with: node --test tests/gameplay.test.cjs (no dependencies).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'neon-survivors.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function createGame({ reducedMotion = false, languages = ['pt-BR'], language = 'pt-BR', touch = false } = {}) {
    function element() {
        const classes = new Set();
        const attributes = new Map();
        return {
            style: {}, value: '', textContent: '', innerHTML: '', children: [],
            classList: { add: key => classes.add(key), remove: key => classes.delete(key), toggle: (key, on) => on ? classes.add(key) : classes.delete(key) },
            appendChild(child) { this.children.push(child); },
            setAttribute(key, value) { attributes.set(key, String(value)); },
            getAttribute(key) { return attributes.get(key) ?? null; },
            addEventListener() {}, getContext() { return {}; },
            click() { this.onclick?.(); }
        };
    }
    const elements = new Map();
    const staticElements = [...html.matchAll(/<[a-z][^>]*>/g)].map(([tag]) => {
        const node = element();
        for (const [, key, value] of tag.matchAll(/([\w-]+)="([^"]*)"/g)) node.setAttribute(key, value);
        if (node.getAttribute('id')) elements.set(node.getAttribute('id'), node);
        return node;
    });
    const document = {
        hidden: false, body: element(), documentElement: element(),
        getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
        createElement: element,
        querySelector(selector) { return staticElements.find(node => node.getAttribute('class') === selector.slice(1)); },
        querySelectorAll(selector) { return staticElements.filter(node => node.getAttribute(selector.slice(1, -1)) !== null); },
        addEventListener() {}
    };
    const context = vm.createContext({
        document, console, performance,
        window: { innerWidth: 1280, innerHeight: 720, addEventListener() {}, matchMedia: () => ({ matches: reducedMotion }) },
        navigator: { languages, language, maxTouchPoints: touch ? 1 : 0, getGamepads: () => [] },
        localStorage: { getItem: () => null, setItem() {} },
        setInterval() {}, setTimeout() {}, requestAnimationFrame() {}, cancelAnimationFrame() {}
    });
    vm.runInContext(script, context);
    const run = source => vm.runInContext(source, context);
    run(`
        initGame();
        player.lastShot = Infinity;
        game.lastBoss = game.lastTreasure = game.lastMiniPowerup = Infinity;
        function testEnemy(x, y, health = 20) {
            return { x, y, radius: 15, speed: 0, health, maxHealth: health, color: '#ff4444', xp: 2, isBoss: false };
        }
    `);
    return run;
}

test('language selection honors browser preference order, regional variants and English fallback', () => {
    const cases = [
        { languages: ['en-US', 'pt-BR'], expected: 'en' },
        { languages: ['pt-PT', 'en-GB'], expected: 'pt-BR' },
        { languages: ['fr-FR', 'en-GB', 'pt-BR'], expected: 'en' },
        { languages: ['fr-FR', 'PT-br', 'en'], expected: 'pt-BR' },
        { languages: ['en'], expected: 'en' },
        { languages: ['pt'], expected: 'pt-BR' },
        { languages: ['de-DE', 'ja-JP'], language: 'de-DE', expected: 'en' },
        { languages: [], language: 'en-GB', expected: 'en' },
        { languages: null, language: 'pt-PT', expected: 'pt-BR' },
        { languages: null, language: null, expected: 'en' }
    ];
    for (const { expected, ...preferences } of cases) {
        const run = createGame(preferences);
        assert.equal(run('document.documentElement.lang'), expected, JSON.stringify(preferences));
    }
});

for (const locale of ['en-US', 'pt-BR']) {
    const english = locale === 'en-US';
    test(`${locale} localizes menus, accessibility, upgrades, challenge phases and results`, () => {
        const run = createGame({ languages: [locale] });
        assert.equal(run("document.getElementById('startBtn').innerHTML"), english ? 'ENTER THE ARENA →' : 'ENTRAR NA ARENA →');
        assert.match(run("document.querySelector('.instructions').innerHTML"), english ? /ARROW KEYS/ : /SETAS/);
        assert.match(run("document.getElementById('difficultyBar').getAttribute('aria-label')"), english ? /^Difficulty:/ : /^Dificuldade:/);
        assert.equal(run("document.getElementById('musicToggle').getAttribute('title')"), english ? 'Music (M)' : 'Música (M)');
        run('music.muted = true; updateMusicUI(); sfx.muted = true; updateSfxUI()');
        assert.equal(run("document.getElementById('musicToggle').getAttribute('aria-label')"), english ? 'Unmute music' : 'Ativar música');
        assert.equal(run("document.getElementById('sfxToggle').textContent"), english ? 'Unmute effects' : 'Ativar efeitos');
        run('music.muted = false; updateMusicUI(); sfx.muted = false; updateSfxUI()');
        assert.equal(run("document.getElementById('musicToggle').getAttribute('aria-label')"), english ? 'Mute music' : 'Silenciar música');
        assert.equal(run("document.getElementById('sfxToggle').textContent"), english ? 'Mute effects' : 'Silenciar efeitos');

        assert.equal(run('allUpgrades[0].name'), english ? 'Damage' : 'Dano');
        assert.equal(run('allUpgrades[0].desc'), english ? '+10 damage' : '+10 de dano');
        run("powerLevels.damage = 2; updatePowerLevelsUI()");
        assert.equal(run("document.getElementById('powerLevels').children[0].title"), english ? 'Damage: level 2' : 'Dano: nível 2');
        run('levelUp()');
        assert.equal(run('upgradeButtons.length'), 3);
        assert.ok(run('upgradeButtons.every(button => !button.innerHTML.includes("undefined"))'));
        run('upgradeButtons[0].click()');
        assert.equal(run('game.paused'), false);

        run('game.time = game.nextChallenge; updateChallenges()');
        assert.match(run("document.getElementById('challengeDisplay').innerHTML"), english ? /GET READY · CROSSFIRE/ : /PREPARE-SE · FOGO CRUZADO/);
        assert.match(run("document.getElementById('challengeDisplay').innerHTML"), english ? /Dodge the shots/ : /Desvie dos tiros/);
        run('game.time = game.challenge.startsAt; updateChallenges()');
        assert.doesNotMatch(run("document.getElementById('challengeDisplay').innerHTML"), /GET READY|PREPARE-SE/);
        run('game.time = game.challenge.endsAt; updateChallenges()');
        assert.match(run("document.getElementById('challengeDisplay').textContent"), english ? /CHALLENGE COMPLETE/ : /DESAFIO SUPERADO/);
        run('showWave()');
        assert.equal(run("document.getElementById('waveDisplay').textContent"), english ? '🌊 WAVE 1 🌊' : '🌊 ONDA 1 🌊');

        run('treasures = [{ x: player.x, y: player.y, radius: 20, rotation: 0, power: superPowers[1] }]; update(16)');
        assert.equal(run("document.getElementById('powerupDisplay').textContent"), english ? '🛡️ SHIELD!' : '🛡️ ESCUDO!');
        run('gameOver()');
        assert.match(run("document.getElementById('finalStats').innerHTML"), english ? /Time:.*Challenges: 1/ : /Tempo:.*Desafios: 1/);
    });

    test(`${locale} uses localized touch instructions`, () => {
        const run = createGame({ languages: [locale], touch: true });
        assert.equal(run('isTouchDevice'), true);
        assert.match(run("document.querySelector('.instructions').innerHTML"), english ? /TAP.*the threat bar/ : /TOQUE.*na barra/);
        assert.doesNotMatch(run("document.querySelector('.instructions').innerHTML"), /WASD/);
    });
}

test('difficulty caps at 1000% and preserves proportional spawn at 500% and 1000%', () => {
    const run = createGame();
    assert.equal(run('adjustDifficulty(100); spawnMultiplier'), 10);
    assert.equal(run('adjustDifficulty(-100); spawnMultiplier'), 0.2);
    const count = multiplier => run(`
        initGame(); player.lastShot = Infinity; player.shieldUntil = Infinity; player.xpToLevel = Infinity;
        spawnMultiplier = ${multiplier};
        for (let i = 0; i < 200; i++) update(50);
        enemies.length;
    `);
    const normal = count(1);
    for (const multiplier of [5, 10]) {
        const maximum = count(multiplier);
        assert.ok(maximum >= normal * multiplier * 0.9 && maximum <= normal * multiplier * 1.1, `${normal} vs ${maximum} at ${multiplier}`);
    }
});

test('high threat increases health and damage, and survival time keeps scaling resistance', () => {
    const run = createGame();
    run('spawnMultiplier = 1; const normalEnemy = spawnEnemy(0); spawnMultiplier = 10; const hardEnemy = spawnEnemy(0)');
    assert.ok(run('hardEnemy.health > normalEnemy.health * 2.5'));
    assert.ok(run('hardEnemy.damage > normalEnemy.damage * 1.8'));
    run('game.time = 180000; const lateEnemy = spawnEnemy(0)');
    assert.ok(run('lateEnemy.health > hardEnemy.health * 2'));
    assert.ok(run('lateEnemy.speed <= normalEnemy.speed * 1.4'));
    run('for (let i = 0; i < 500; i++) spawnEnemy()');
    assert.equal(run('enemies.length'), run('MAX_ENEMIES'));
});

test('sentries telegraph, lock aim, respect freeze, and fire only while visible', () => {
    const run = createGame();
    run(`const sentry = spawnEnemy(6); sentry.x = player.x - 250; sentry.y = player.y;
        sentry.speed = 0; sentry.attackTimer = 0; updateEnemies(16);`);
    assert.equal(run('enemyProjectiles.length'), 0);
    assert.equal(run('sentry.windupLeft'), 850);
    run('player.y += 120; player.freezeUntil = 1000; updateEnemies(900)');
    assert.equal(run('sentry.windupLeft'), 850);
    run('player.freezeUntil = 0; updateEnemies(800)');
    assert.equal(run('enemyProjectiles.length'), 0);
    run('updateEnemies(50)');
    assert.equal(run('enemyProjectiles.length'), 1);
    assert.equal(run('enemyProjectiles[0].vy'), 0);
    run('enemyProjectiles = []; sentry.x = -10; sentry.attackTimer = 0; updateEnemies(1000)');
    assert.equal(run('enemyProjectiles.length'), 0);
    assert.equal(run('sentry.windupLeft'), 0);
});

test('artillery fires a spread, bosses fire rings, and defeated shooters cannot attack', () => {
    const run = createGame();
    run(`const artillery = spawnEnemy(7); artillery.x = player.x - 240; artillery.y = player.y;
        artillery.attackTimer = 0; updateEnemies(16); updateEnemies(1000);`);
    assert.equal(run('enemyProjectiles.length'), 3);
    assert.ok(run('enemyProjectiles[0].vy < 0 && enemyProjectiles[2].vy > 0'));
    run(`enemies = []; enemyProjectiles = []; spawnBoss(); const boss = enemies[0];
        boss.x = 200; boss.y = 200; boss.attackTimer = 0; updateEnemies(16); updateEnemies(1200);`);
    assert.equal(run('enemyProjectiles.length'), 10);
    run('enemyProjectiles = []; boss.health = 0; resolveDefeatedEnemies(); updateEnemies(5000)');
    assert.equal(run('enemyProjectiles.length'), 0);
});

test('chargers hold during the warning then dash in the locked direction', () => {
    const run = createGame();
    run(`const charger = spawnEnemy(8); charger.x = player.x - 250; charger.y = player.y;
        charger.attackTimer = 0; charger.speed = 0; updateEnemies(16);
        const startX = charger.x, startY = charger.y; player.y += 150; updateEnemies(500);`);
    assert.equal(run('charger.x'), run('startX'));
    run('updateEnemies(400); updateEnemies(100)');
    assert.ok(run('charger.x > startX'));
    assert.equal(run('charger.y'), run('startY'));
});

test('bombers mark a fixed area; impacts wait, freeze, and deal damage once', () => {
    const run = createGame();
    run(`const bomber = spawnEnemy(9); bomber.x = player.x - 240; bomber.y = player.y;
        bomber.speed = 0; bomber.attackTimer = 0; updateEnemies(16); updateEnemies(600);`);
    assert.equal(run('hazards.length'), 1);
    assert.equal(run('hazards[0].x'), run('player.x'));
    run('player.freezeUntil = 1000; updateEnemyAttacks(1400)');
    assert.equal(run('hazards[0].remaining'), 1400);
    run('player.freezeUntil = 0; updateEnemyAttacks(1399)');
    assert.equal(run('player.health'), 100);
    run('updateEnemyAttacks(1)');
    assert.equal(run('player.health'), 85);
    assert.equal(run('hazards.length'), 0);
    run('updateEnemyAttacks(100)');
    assert.equal(run('player.health'), 85);
    run('player.hurtUntil = 0; addHazard(player.x - 200, player.y, 72, 20); updateEnemyAttacks(1400)');
    assert.equal(run('player.health'), 85);
});

test('hostile bullets use swept collisions, shared invulnerability, shield, lifetime and freeze', () => {
    const run = createGame();
    run(`function bullet() { return { x: player.x - 100, y: player.y, vx: 200, vy: 0, radius: 5, damage: 12, life: 4200 }; }
        enemyProjectiles = [bullet(), bullet()]; updateEnemyAttacks(1000 / 60);`);
    assert.equal(run('player.health'), 88);
    assert.equal(run('enemyProjectiles.length'), 0);
    run('player.hurtUntil = 0; player.shieldUntil = 1000; enemyProjectiles = [bullet()]; updateEnemyAttacks(1000 / 60)');
    assert.equal(run('player.health'), 88);
    run('enemyProjectiles = [bullet()]; player.freezeUntil = 1000; updateEnemyAttacks(100)');
    assert.equal(run('enemyProjectiles[0].x'), run('player.x - 100'));
    assert.equal(run('enemyProjectiles[0].life'), 4200);
    run('player.freezeUntil = 0; enemyProjectiles[0].vx = 0; updateEnemyAttacks(4201)');
    assert.equal(run('enemyProjectiles.length'), 0);
});

test('challenges alternate, warn before spawning, pause, reward once and reset on restart', () => {
    const run = createGame();
    for (const expected of ['FOGO CRUZADO', 'ZONA DE CERCO', 'CAÇADA']) {
        run('enemies = []; game.time = game.nextChallenge; updateChallenges()');
        assert.equal(run('game.challenge.name'), expected);
        assert.equal(run('enemies.length'), 0);
        run('game.paused = true; globalThis.constTime = game.time; update(50)');
        assert.equal(run('game.time'), run('constTime'));
        run('game.paused = false; game.time = game.challenge.startsAt; updateChallenges()');
        assert.equal(run('enemies.length'), 1);
        const rewardsBefore = run('treasures.length');
        run('game.time = game.challenge.endsAt; updateChallenges(); updateChallenges()');
        assert.equal(run('treasures.length'), rewardsBefore + 1);
    }
    assert.equal(run('game.challengesSurvived'), 3);
    run('enemyProjectiles = [{}]; hazards = [{}]; initGame()');
    assert.equal(run('enemyProjectiles.length + hazards.length + game.challengesSurvived'), 0);
    assert.equal(run('game.challenge'), null);
    assert.equal(run('game.nextChallenge'), 25000);
});

test('lifesteal remains useful but a dense pack cannot instantly refill all health', () => {
    const run = createGame();
    run(`player.health = 20; player.lifesteal = 30; killsForNextWave = Infinity;
        enemies = Array.from({length: 30}, () => testEnemy(100, 100, 0)); resolveDefeatedEnemies();`);
    assert.equal(run('player.health'), 28);
    run('update(1000); enemies = [testEnemy(100, 100, 0)]; resolveDefeatedEnemies()');
    assert.equal(run('player.health'), 36);
});

test('parallax tracks travel without screen-wrap jumps and respects pause and reduced motion', () => {
    const run = createGame();
    run('player.x = canvas.width + player.radius - 1; keys.d = true; update(1000 / 60)');
    assert.equal(run('parallax.x'), 4.5);
    assert.equal(run('player.x'), -18);
    run('game.paused = true; update(50)');
    assert.equal(run('parallax.x'), 4.5);
    run('initGame()');
    assert.equal(run('parallax.x + parallax.y'), 0);
    const reduced = createGame({ reducedMotion: true });
    reduced('keys.d = true; update(50)');
    assert.equal(reduced('parallax.x + parallax.y'), 0);
});

test('effects throttle frequent cues, cap polyphony, release nodes and obey independent mute', () => {
    const run = createGame();
    run(`const createdVoices = [];
        audioCtx = { state: 'running', currentTime: 1,
            createOscillator() {
                const voice = { frequency: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
                    connect() {}, disconnect() {}, start() {}, stop(at) { if (at === undefined) this.onended?.(); } };
                createdVoices.push(voice); return voice;
            },
            createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
        };
        sfx.bus = {}; sfx.input = {};
        playSound('shoot'); playSound('shoot'); playSound('unknown');`);
    assert.equal(run('createdVoices.length'), 1);
    run("for (let i = 0; i < 20; i++) { audioCtx.currentTime++; playSound('shoot'); }");
    assert.equal(run('sfx.voices.size'), 6);
    run("for (let i = 0; i < 20; i++) { audioCtx.currentTime++; playSound('hurt'); }");
    assert.equal(run('sfx.voices.size'), 10);
    assert.ok(run("createdVoices.every(voice => ['sine', 'triangle'].includes(voice.type))"));
    run("stopSfxVoices(); sfx.muted = true; audioCtx.currentTime++; playSound('boss')");
    assert.equal(run('sfx.voices.size'), 0);
    assert.equal(run('createdVoices.length'), 10);
    run("sfx.muted = false; sfx.volume = 0; audioCtx.currentTime++; playSound('boss')");
    assert.equal(run('sfx.voices.size'), 0);
});

test('lightning kills every chained target and grants combo, wave and XP rewards', () => {
    const run = createGame();
    run(`player.lightningLevel = 1;
        enemies = [110, 210, 310].map(x => testEnemy(player.x + x, player.y));
        updateWeapons(16); resolveDefeatedEnemies();`);
    assert.equal(run('game.kills'), 3);
    assert.equal(run('combo'), 3);
    assert.equal(run('waveKills'), 3);
    assert.equal(run('xpOrbs.length'), 3);
});

test('drones damage on contact with a cooldown and frost slows surviving enemies', () => {
    const run = createGame();
    run(`player.orbitLevel = 1; const drone = dronePositions()[0];
        enemies = [testEnemy(drone.x, drone.y, 100)]; updateWeapons(16);`);
    const firstHealth = run('enemies[0].health');
    assert.ok(firstHealth < 100);
    run('updateWeapons(16)');
    assert.equal(run('enemies[0].health'), firstHealth);
    run('player.frostLevel = 1; updateWeapons(16)');
    assert.ok(run('enemies[0].health') < firstHealth);
    assert.ok(run('enemies[0].slowUntil > game.time'));
});

test('meteor levels launch all available impacts and reward area kills', () => {
    const run = createGame();
    run(`player.meteorLevel = 5;
        enemies = [50, 100, 150, 200, 250].map(x => testEnemy(player.x + x, player.y));
        updateWeapons(16);`);
    assert.equal(run('meteors.length'), 5);
    run('updateWeapons(1600); resolveDefeatedEnemies()');
    assert.equal(run('game.kills'), 5);
    assert.equal(run('meteors.length'), 0);
});

test('explosion chains settle every death once, including boss bomb rewards', () => {
    const run = createGame();
    run(`player.explodeOnKill = 100;
        enemies = [testEnemy(100, 100, 0), testEnemy(140, 100, 5), testEnemy(180, 100, 5)];
        resolveDefeatedEnemies(); resolveDefeatedEnemies();`);
    assert.equal(run('game.kills'), 3);
    assert.equal(run('enemies.length'), 0);
    run('initGame(); spawnBoss(); superPowers[0].apply()');
    assert.equal(run('game.bossesKilled'), 1);
    assert.equal(run('xpOrbs.length'), 10);
});

test('temporary buffs respect pause, preserve permanent upgrades and reset', () => {
    const run = createGame();
    run(`superPowers[3].apply(); allUpgrades.find(u => u.id === 'damage').apply(); game.time = 11000;`);
    assert.equal(run('currentDamage()'), 40);
    run('superPowers[1].apply(); game.paused = true; update(5000)');
    assert.equal(run('game.time'), 11000);
    assert.equal(run('player.shieldUntil'), 19000);
    run('initGame()');
    assert.equal(run('player.shieldUntil + player.furyUntil + player.freezeUntil'), 0);
    assert.equal(run('effects.length + meteors.length'), 0);
});

test('every level gained in one pickup gets an upgrade choice', () => {
    const run = createGame();
    run('player.xp = 55; collectLevelUps()');
    const pending = run('game.pendingUpgrades');
    assert.ok(pending >= 3);
    for (let i = 0; i < pending; i++) run('upgradeButtons[0].click()');
    assert.equal(run('game.pendingUpgrades'), 0);
    assert.equal(run('game.paused'), false);
    assert.equal(run('Object.values(powerLevels).reduce((sum, level) => sum + level, 0)'), pending);
});

test('piercing projectiles never damage the same enemy twice', () => {
    const run = createGame();
    run(`enemies = [testEnemy(player.x + 30, player.y, 100)];
        projectiles = [{ x: player.x, y: player.y, vx: 25, vy: 0, radius: 5, damage: 20, pierce: 10, hit: new Set(), bounces: 0, life: 3500 }];
        update(16); update(16);`);
    assert.equal(run('enemies[0].health'), 80);
});

test('time freeze stops enemies and the global magnet attracts distant XP', () => {
    const run = createGame();
    run('player.freezeUntil = 6000; enemies = [testEnemy(player.x + 200, player.y, 100)]; enemies[0].speed = 3');
    const x = run('enemies[0].x');
    run('update(50)');
    assert.equal(run('enemies[0].x'), x);
    run(`temporaryPowerups.find(p => p.name === 'Ímã Total').apply();
        xpOrbs = [{ x: player.x + 350, y: player.y, xp: 2, radius: 6 }]; update(50);`);
    assert.ok(run('xpOrbs[0].x < player.x + 350'));
});

test('radio shuffles all five compositions without adjacent repeats', () => {
    const run = createGame();
    const sequence = Array.from({ length: 20 }, () => run('chooseMusicTrack(); music.track'));
    for (let i = 0; i < sequence.length; i += 5) assert.equal(new Set(sequence.slice(i, i + 5)).size, 5);
    sequence.forEach((track, i) => { if (i) assert.notEqual(track, sequence[i - 1]); });
});

test('radio advances automatically after the final scheduled beat', () => {
    const run = createGame();
    run(`audioCtx = { currentTime: 1, state: 'running' };
        music.bus = { gain: { setTargetAtTime() {} } };
        music.track = 0; music.bag = [1]; music.step = 512;
        music.playing = true; music.nextTime = 0.8;
        gameRunning = true;
        scheduleMusicStep = () => {};
        syncMusic();`);
    assert.equal(run('music.track'), 1);
    assert.ok(run('music.step > 0 && music.step < 512'));
});
