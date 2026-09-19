// Run with: node --test tests/gameplay.test.cjs (no dependencies).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'neon-survivors.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function createGame() {
    function element() {
        const classes = new Set();
        return {
            style: {}, value: '', textContent: '', innerHTML: '', children: [],
            classList: { add: key => classes.add(key), remove: key => classes.delete(key), toggle: (key, on) => on ? classes.add(key) : classes.delete(key) },
            appendChild(child) { this.children.push(child); },
            setAttribute() {}, addEventListener() {}, getContext() { return {}; },
            click() { this.onclick?.(); }
        };
    }
    const elements = new Map();
    const document = {
        hidden: false, body: element(), documentElement: element(),
        getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
        createElement: element, querySelector: element, addEventListener() {}
    };
    const context = vm.createContext({
        document, console, performance,
        window: { innerWidth: 1280, innerHeight: 720, addEventListener() {}, matchMedia: () => ({ matches: false }) },
        navigator: { maxTouchPoints: 0, getGamepads: () => [] },
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

test('spawn caps at 500% and creates about five times as many enemies', () => {
    const run = createGame();
    assert.equal(run('adjustDifficulty(100); spawnMultiplier'), 5);
    assert.equal(run('adjustDifficulty(-100); spawnMultiplier'), 0.2);
    const count = multiplier => run(`
        initGame(); player.lastShot = Infinity; player.shieldUntil = Infinity; player.xpToLevel = Infinity;
        spawnMultiplier = ${multiplier};
        for (let i = 0; i < 200; i++) update(50);
        enemies.length;
    `);
    const normal = count(1), maximum = count(5);
    assert.ok(maximum >= normal * 4.5 && maximum <= normal * 5.5, `${normal} vs ${maximum}`);
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
