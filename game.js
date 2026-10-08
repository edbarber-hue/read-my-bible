// Sky Run — original side-view runner. Hold to fly, release to fall.
const canvas = $('#gameCanvas'); let ctx = canvas.getContext('2d');   // ctx is swapped briefly to draw the HD card preview
const W = 960, H = 540, PX = 200, MAX_HEARTS = 5;
const FLIGHT_OUTFITS = ['coral-scout', 'sky-pilot', 'forest-ranger', 'royal-adventurer', 'sunset-surfer', 'golden-guardian', 'night-explorer', 'ocean-voyager'];
let game = null, hold = false, frameId = 0, lastTime = 0;
const testOpts = { invincible: false, startAt2000: false, startPower: false };

// ---------- Art ----------
function loadImg(src) { const im = new Image(); im.src = src; return im; }
const sheets = { boy: loadImg('turnarounds/boy-flight-outfits.webp'), girl: loadImg('turnarounds/girl-flight-outfits.webp') };
// Throwing poses (with the explorer's own hairstyle). Release frames are drawn a little bigger so the head matches the flying frame.
const POSE = { boy: { flight: [460, 222.5], release: { s: 1.197, eye: [370, 238.5] } }, girl: { flight: [471, 217], release: { s: 1.095, eye: [366, 263.5] } } };
let throwArt = { key: null, windup: null, release: null };
function throwSheet(p, pose) {
  const key = [p.gender, p.hair, p.hairColor, p.skin].join('|');
  if (throwArt.key !== key && window.buildRunnerSheet) { throwArt = { key, windup: null, release: null }; for (const ps of ['windup', 'release']) buildRunnerSheet(p, '-throw-' + ps).then(c => { if (throwArt.key === key) throwArt[ps] = c; }).catch(() => { }); }
  return throwArt[pose];
}
const ready = im => im && im.complete && im.naturalWidth > 0;
const cosmeticSprites = new Map(COSMETICS.map(item => [item.id, loadImg(cosmeticDataUrl(item))]));
// Real accessory art cut from the turnaround sheets, placed on the flying head.
const accSprites = {};
function accSprite(gender, id) { const k = gender + '-' + id; if (!(k in accSprites)) accSprites[k] = window.FLIGHT_ACC?.[gender]?.[id] ? loadImg(`turnarounds/flight/acc/${k}.webp`) : null; return accSprites[k]; }
// Per-profile flying sprite (hairstyle + skin applied when available). Falls back to the outfit sheet.
let runnerArt = null;  // {key, sheet} where sheet is an Image or canvas with the 4×2 outfit layout
function runnerSheet(p) {
  if (window.buildRunnerSheet) {
    const key = [p.gender, p.hair, p.hairColor, p.skin].join('|');
    if (runnerArt?.key !== key) { runnerArt = { key, sheet: null }; window.buildRunnerSheet(p).then(c => { if (runnerArt.key === key) runnerArt.sheet = c; }).catch(() => { }); }
    if (runnerArt.sheet) return runnerArt.sheet;
  }
  return sheets[p.gender];
}
const tint = document.createElement('canvas'); tint.width = tint.height = 240; const tctx = tint.getContext('2d');

// ---------- Open / close ----------
function openGame() {
  const p = profile();
  if (!p || !canPlay(p)) { toast('Finish today’s reading first'); return; }
  closeModal();
  $('#gameLayer').classList.remove('hidden');
  document.body.classList.add('playing');
  $('#bestCounter').textContent = p.best || 0;
  showStartCard();
  drawIdle();
}
function showStartCard() {
  const master = isMaster();
  $('#gameOverlay').classList.remove('hidden');
  $('#gameOverlay .game-overlay-card').innerHTML = `<div class="eyebrow">READY TO FLY?</div><h2>Sky Run</h2><p>Hold the screen (or Space) to fly up. Let go to fall. Dodge gears and zappers, grab stars, and catch the glowing Bible to throw pages!</p>${master ? `<div class="test-options"><label><input type="checkbox" data-opt="startAt2000" ${testOpts.startAt2000 ? 'checked' : ''}> Start at 2,000 (UFO)</label><label><input type="checkbox" data-opt="invincible" ${testOpts.invincible ? 'checked' : ''}> Unlimited hearts</label><label><input type="checkbox" data-opt="startPower" ${testOpts.startPower ? 'checked' : ''}> Start with Bible pages</label></div>` : ''}<button id="startRunButton" class="button primary">Start run</button>`;
  $('#gameOverlay').querySelectorAll('[data-opt]').forEach(c => c.onchange = () => testOpts[c.dataset.opt] = c.checked);
  $('#startRunButton').onclick = startRun;
}
function closeGame() { SkyAudio.scene('home'); if (game) game.running = false; cancelAnimationFrame(frameId); hold = false; $('#gameLayer').classList.add('hidden'); document.body.classList.remove('playing'); render(); }

// ---------- Run ----------
function startRun() {
  const p = profile(), master = isMaster();
  game = {
    running: true, y: 265, vy: 0, score: master && testOpts.startAt2000 ? 1990 : 0, gems: 0, stars: 0, hearts: 3, t: 0,
    spawn: 50, spawns: 0, hazards: [], gemList: [], starList: [], powerups: [], heartUps: [], nextHeartT: 900, shots: [], lasers: [], particles: [], rings: [], popups: [], heartFx: [],
    invuln: 0, hurt: 0, shine: 0, power: master && testOpts.startPower ? 420 : 0, throwT: 0, throwCd: 0, nextPowerT: 600, ufo: null, nextUfo: 2000, ufosBeaten: 0,
    shake: 0, dying: 0, missionDone: false, little: p.age <= 6, invincible: master && testOpts.invincible
  };
  $('#gameOverlay').classList.add('hidden');
  throwSheet(p, 'windup');
  updateHud();
  $('#missionText').textContent = 'Mission: collect 10 gems';
  SkyAudio.start();
  lastTime = performance.now();
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(loop);
}
function endRun() {
  SkyAudio.scene('none'); SkyAudio.sfx('over');
  const p = profile(); game.running = false; cancelAnimationFrame(frameId); hold = false;
  const points = Math.floor(game.score);
  const best = points > (p.best || 0);
  p.best = Math.max(p.best || 0, points); p.totalStars = (p.totalStars || 0) + game.stars; save();
  $('#bestCounter').textContent = p.best;
  $('#gameOverlay').classList.remove('hidden');
  $('#gameOverlay .game-overlay-card').innerHTML = `<div class="eyebrow">${best ? 'NEW BEST!' : 'NICE FLIGHT!'}</div><h2>${points} points</h2><p>You found ${game.gems} ${game.gems === 1 ? 'gem' : 'gems'} and ${game.stars} ${game.stars === 1 ? 'star' : 'stars'}${game.ufosBeaten ? ` and chased away ${game.ufosBeaten} UFO${game.ufosBeaten > 1 ? 's' : ''}` : ''}.${game.missionDone ? ' Mission complete!' : ''}</p><div class="two-col"><button id="runAgain" class="button primary">Fly again</button><button id="runDone" class="button secondary">Done</button></div>`;
  $('#runAgain').onclick = startRun; $('#runDone').onclick = closeGame;
}
function updateHud() { $('#gemCounter').textContent = game.gems; $('#starCounter').textContent = game.stars; $('#scoreCounter').textContent = Math.floor(game.score); }

// ---------- Effects ----------
function burst(x, y, color, count = 12, force = 4) { for (let i = 0; i < count; i++) { const a = Math.PI * 2 * i / count + Math.random() * .3, f = force * (.5 + Math.random()); game.particles.push({ x, y, vx: Math.cos(a) * f, vy: Math.sin(a) * f, life: 22 + Math.random() * 14, color, size: 3 + Math.random() * 4 }); } }
function ring(x, y, color, max = 60) { game.rings.push({ x, y, r: 6, max, life: 22, color }); }
function popup(text, x, y, color = '#fff8eb') { game.popups.push({ text, x, y, life: 60, color }); }
function damage(src, x, y) {
  if (game.invuln > 0 || game.dying) return;
  ring(x, y, '#ff5a4f', 70); burst(x, y, '#ffd166', 14, 5); burst(x, y, '#ff5a4f', 10, 3);
  if (src) src.hitT = 26;
  if (game.invincible) { game.invuln = 60; popup('Test: no damage', PX, game.y - 70); return; }
  SkyAudio.sfx('hit'); game.hearts--; game.heartFx.push({ i: game.hearts, t: 0 });
  game.hurt = 60; game.invuln = 105; game.shake = 16; game.vy = -2.5;
  popup(game.hearts > 0 ? 'Ouch!' : 'Oh no!', PX, game.y - 72, '#ffd7d2');
  if (game.hearts <= 0) { game.dying = 80; hold = false; }
}

// ---------- Spawning ----------
const COLORS_GEAR = [['#ff8a3d', '#c4461b'], ['#3fc1c9', '#1d7a8a'], ['#b07cff', '#6b3fc4'], ['#ffd23f', '#c48a10']];
function spawnWave() {
  const s = game.score, y = 95 + Math.random() * 330, side = Math.random() < .5 ? -1 : 1;
  const route = Math.max(70, Math.min(470, y + side * 120));
  const zapChance = s < 300 ? .25 : .5;
  if (Math.random() < zapChance) {
    const len = 110 + Math.random() * (s > 1200 ? 90 : 60), angles = s < 600 ? [Math.PI / 2, 0] : [Math.PI / 2, 0, Math.PI / 4, -Math.PI / 4];
    game.hazards.push({ kind: 'zap', x: 1040, y, len, angle: angles[Math.floor(Math.random() * angles.length)], spin: s > 1600 && Math.random() < .35 ? (Math.random() < .5 ? -1 : 1) * .012 : 0, phase: Math.random() * 6 });
  } else {
    const c = COLORS_GEAR[Math.floor(Math.random() * COLORS_GEAR.length)];
    game.hazards.push({ kind: 'gear', x: 1030, y, r: 30 + Math.random() * 10, colors: c, phase: Math.random() * 6, bob: 18 + Math.random() * 16 });
  }
  if (s > 700 && !game.little && game.spawns % 4 === 3) game.hazards.push({ kind: 'gear', x: 1200, y: Math.max(80, Math.min(460, y - side * 160)), r: 28, colors: COLORS_GEAR[0], phase: 0, bob: 22 });
  for (let i = 0; i < 5; i++) game.gemList.push({ x: 1060 + i * 40, y: route + Math.sin(i * .9) * 16, phase: i });
  if (game.spawns % 3 === 2) game.starList.push({ x: 1240, y: Math.max(80, Math.min(450, route + side * 44)), phase: 0 });
  game.spawns++;
  const gap = Math.max(36, 88 - s / 45) + Math.random() * 18;
  game.spawn = gap * (game.ufo ? 1.7 : 1) * (game.little ? 1.25 : 1);
}

// ---------- Main loop ----------
function loop(now) {
  if (!game?.running) return;
  const dt = Math.min((now - lastTime) / 16.67, 2); lastTime = now;
  step(dt); drawGame();
  if (game.dying && (game.dying -= dt) <= 0) { drawGame(); endRun(); return; }
  frameId = requestAnimationFrame(loop);
}
function step(dt) {
  const g = game;
  g.t += dt; if (!g.dying) g.score += dt * .95;
  ['invuln', 'hurt', 'shine', 'throwT', 'shake'].forEach(k => g[k] = Math.max(0, g[k] - dt));
  // Flight
  const up = hold && !g.dying;
  g.vy += (up ? -.5 : .36) * dt; g.vy = Math.max(-7, Math.min(7.4, g.vy)); g.y += g.vy * dt;
  if (g.y < 50) { g.y = 50; g.vy = 0; } if (g.y > 472) { g.y = 472; g.vy = 0; }
  if (g.dying) { g.particles.forEach(o => { o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt; }); g.heartFx.forEach(h => h.t += dt); g.rings.forEach(r => { r.life -= dt; r.r += (r.max - r.r) * .2 * dt; }); g.popups.forEach(o => { o.y -= dt * .6; o.life -= dt; }); return; }
  // Spawns
  if ((g.spawn -= dt) <= 0) spawnWave();
  // Floating hearts give back a life (up to 5). They come sooner when you're low.
  if (g.t >= g.nextHeartT) { if (g.hearts < MAX_HEARTS) g.heartUps.push({ x: 1010, y: 100 + Math.random() * 320, phase: 0 }); g.nextHeartT = g.t + (g.hearts <= 1 ? 600 : g.hearts === 2 ? 1000 : 1700) + Math.random() * 500; }
  if (g.t >= g.nextPowerT) { g.powerups.push({ x: 1010, y: 110 + Math.random() * 300, phase: 0 }); g.nextPowerT = g.t + (g.ufo ? 520 : 1400) + Math.random() * 400; }
  if (!g.ufo && g.score >= g.nextUfo) spawnUfo();
  const speed = (4.3 + Math.min(8.5, g.score / 190)) * (g.little ? .8 : 1) * dt;
  for (const o of g.hazards) { o.x -= speed; o.phase += dt * .05; if (o.spin) o.angle += o.spin * dt; if (o.hitT) o.hitT = Math.max(0, o.hitT - dt); }
  for (const o of [...g.gemList, ...g.starList, ...g.powerups, ...g.heartUps]) { o.x -= speed; o.phase += dt * .09; }
  for (const o of g.particles) { o.x += o.vx * dt; o.y += o.vy * dt; o.vy += .05 * dt; o.life -= dt; }
  for (const r of g.rings) { r.life -= dt; r.r += (r.max - r.r) * .2 * dt; }
  for (const o of g.popups) { o.y -= dt * .7; o.life -= dt; }
  for (const h of g.heartFx) h.t += dt;
  // Player hit circle
  const py = g.y - 4, pr = 24;
  // Gems
  for (const o of g.gemList) if (!o.hit && Math.hypot(o.x - PX, o.y - py) < 34) { o.hit = true; g.gems++; SkyAudio.sfx('gem'); g.score += 10; burst(o.x, o.y, '#9ff3ff', 8, 3); if (g.gems >= 10 && !g.missionDone) { g.missionDone = true; $('#missionText').textContent = 'Mission complete! Keep collecting gems'; popup('Mission complete!', PX + 80, py - 60, '#fff3a6'); } }
  // Stars: shine + protection
  for (const o of g.starList) if (!o.hit && Math.hypot(o.x - PX, o.y - py) < 36) { o.hit = true; g.stars++; SkyAudio.sfx('star'); g.score += 40; g.shine = 150; g.invuln = Math.max(g.invuln, 120); burst(o.x, o.y, '#ffe473', 26, 5); ring(o.x, o.y, '#fff3a6', 80); popup('Shine!', o.x, o.y - 26, '#fff3a6'); }
  for (const o of g.heartUps) if (!o.hit && Math.hypot(o.x - PX, o.y + Math.sin(o.phase) * 6 - py) < 42) {
    o.hit = true; if (g.hearts < MAX_HEARTS) { g.hearts++; g.heartGain = { i: g.hearts - 1, t: 0 }; }
    SkyAudio.sfx('heart'); burst(o.x, o.y, '#ff6b78', 20, 5); ring(o.x, o.y, '#ff9aa5', 80); popup('+1 life!', o.x, o.y - 34, '#ffd7d2');
  }
  // Power-up: Bible pages
  for (const o of g.powerups) if (!o.hit && Math.hypot(o.x - PX, o.y + Math.sin(o.phase) * 6 - py) < 42) { o.hit = true; g.power = 420; SkyAudio.sfx('power'); g.throwCd = 6; burst(o.x, o.y, '#fff1b0', 24, 5); ring(o.x, o.y, '#ffd45b', 90); popup('Bible pages!', o.x, o.y - 34, '#fff3a6'); }
  // Hazards
  for (const o of g.hazards) {
    if (o.dead) continue;
    if (o.kind === 'gear') { const gy = o.y + Math.sin(o.phase) * o.bob; if (Math.hypot(o.x - PX, gy - py) < o.r + pr - 4) { if (g.shine > 0) smash(o, o.x, gy); else damage(o, (o.x + PX) / 2, (gy + py) / 2); } }
    else { const [x1, y1, x2, y2] = zapEnds(o), d = distToSeg(PX, py, x1, y1, x2, y2); if (d < pr - 2) { const c = closestOnSeg(PX, py, x1, y1, x2, y2); if (g.shine > 0) smash(o, c[0], c[1]); else damage(o, c[0], c[1]); } }
  }
  // Throwing pages
  if (g.power > 0) {
    g.power -= dt; g.throwCd -= dt;
    if (g.throwCd <= 0) { throwPage(); g.throwCd = 22; }
    if (g.power <= 0) popup('Pages all thrown!', PX, py - 70);
  }
  for (const s of g.shots) {
    if (s.delay > 0) { s.delay -= dt; s.x = PX + 62; s.y = g.y - 10; continue; }
    s.x += s.vx * dt; s.y += s.vy * dt; s.rot += .25 * dt;
    for (const o of g.hazards) {
      if (o.dead || s.hit) continue;
      if (o.kind === 'gear') { const gy = o.y + Math.sin(o.phase) * o.bob; if (Math.hypot(o.x - s.x, gy - s.y) < o.r + 10) { s.hit = true; smash(o, o.x, gy, true); } }
      else { const [x1, y1, x2, y2] = zapEnds(o); if (distToSeg(s.x, s.y, x1, y1, x2, y2) < 16) { s.hit = true; smash(o, s.x, s.y, true); } }
    }
    const u = g.ufo;
    if (u && !s.hit && !u.leaving && Math.abs(s.x - u.x) < 62 && Math.abs(s.y - u.y) < 34) {
      s.hit = true; u.hp--; u.flash = 12; ring(s.x, s.y, '#fff3a6', 50); burst(s.x, s.y, '#fff3a6', 10, 4);
      if (u.hp <= 0) { burst(u.x, u.y, '#7dff9b', 34, 7); burst(u.x, u.y, '#ffffff', 20, 5); ring(u.x, u.y, '#7dff9b', 140); g.score += 300; g.ufosBeaten++; popup('UFO cleared! +300', u.x, u.y - 50, '#c8ffd4'); g.ufo = null; g.nextUfo = g.score + 1500; g.shake = 10; SkyAudio.scene('run'); }
    }
  }
  // UFO
  if (g.ufo) stepUfo(dt, py, pr);
  for (const l of g.lasers) { l.x += l.vx * dt; l.y += l.vy * dt; if (!l.hit && Math.hypot(l.x - PX, l.y - py) < pr + 6) { l.hit = true; damage(null, l.x, l.y); } }
  // Trail
  if (up && Math.random() < .85) { const trail = equippedCosmetic(profile(), 'trail'); g.particles.push({ x: PX - 30, y: g.y + 22, vx: -2 - Math.random() * 3, vy: (Math.random() - .5) * 3, life: 24, color: trail?.id === 'sky-bolt' ? ['#22cbff', '#0035e3', '#ffffff'][Math.floor(Math.random() * 3)] : trail?.colors[0] || '#ffd16a', kind: trail?.id || 'spark', size: 5 }); }
  // Clean up
  g.hazards = g.hazards.filter(o => o.x > -140 && !(o.dead && o.deadT-- <= 0));
  g.gemList = g.gemList.filter(o => o.x > -30 && !o.hit); g.starList = g.starList.filter(o => o.x > -30 && !o.hit); g.powerups = g.powerups.filter(o => o.x > -40 && !o.hit); g.heartUps = g.heartUps.filter(o => o.x > -40 && !o.hit);
  g.shots = g.shots.filter(s => !s.hit && s.x < 1000 && s.y > -30 && s.y < 570); g.lasers = g.lasers.filter(l => !l.hit && l.x > -30 && l.y > -30 && l.y < 570);
  g.particles = g.particles.filter(o => o.life > 0); g.rings = g.rings.filter(r => r.life > 0); g.popups = g.popups.filter(o => o.life > 0); g.heartFx = g.heartFx.filter(h => h.t < 70);
  updateHud();
  $('#powerText').textContent = g.power > 0 ? `Throwing Bible pages! ${Math.ceil(g.power / 60)}s` : g.ufo ? 'UFO! Grab a glowing Bible to fight back!' : 'Grab a glowing Bible to throw pages!';
}
function smash(o, x, y, byPage = false) {
  o.dead = true; o.deadT = 0; SkyAudio.sfx('smash'); burst(x, y, byPage ? '#fff3a6' : '#ffe473', 18, 5); ring(x, y, '#fff3a6', 70);
  game.score += 25; popup('+25', x, y - 20, '#fff3a6');
}
function throwPage() {
  const g = game, sx = PX + 34, sy = g.y - 18; let tx = sx + 400, ty = sy;
  if (g.ufo && !g.ufo.leaving) { tx = g.ufo.x; ty = g.ufo.y; }
  else { const ahead = g.hazards.filter(o => !o.dead && o.x > PX + 40 && o.x < 900).sort((a, b) => a.x - b.x)[0]; if (ahead) { tx = ahead.x; ty = ahead.kind === 'gear' ? ahead.y + Math.sin(ahead.phase) * ahead.bob : ahead.y; } }
  const d = Math.hypot(tx - sx, ty - sy) || 1;
  g.shots.push({ x: sx, y: sy, vx: (tx - sx) / d * 14, vy: (ty - sy) / d * 14, rot: 0, delay: 8 });
  g.throwT = 16; SkyAudio.sfx('throw');
}
function spawnUfo() {
  game.ufo = { x: 1080, y: 150, tx: 790, hp: game.little ? 4 : 6, max: game.little ? 4 : 6, fire: 110, life: 1600, phase: 0, flash: 0, leaving: false };
  popup('UFO incoming!', 640, 120, '#c8ffd4'); SkyAudio.sfx('ufo'); SkyAudio.scene('ufo');
  game.nextPowerT = Math.min(game.nextPowerT, game.t + 90);
}
function stepUfo(dt, py, pr) {
  const u = game.ufo; u.phase += dt * .018; u.flash = Math.max(0, u.flash - dt); u.life -= dt;
  if (u.life <= 0 && !u.leaving) { u.leaving = true; u.tx = 1150; popup('The UFO flew away!', 700, 110); }
  u.x += (u.tx - u.x) * .03 * dt;
  u.y = 270 + Math.sin(u.phase) * 160;
  if (u.leaving) { if (u.x > 1100) { game.ufo = null; game.nextUfo = game.score + 1200; SkyAudio.scene('run'); } return; }
  if (u.x < 860 && (u.fire -= dt) <= 0) {
    const sx = u.x - 30, sy = u.y + 22, d = Math.hypot(PX - sx, py - sy) || 1, v = game.little ? 5 : 6.5;
    SkyAudio.sfx('laser'); game.lasers.push({ x: sx, y: sy, vx: (PX - sx) / d * v, vy: (py - sy) / d * v });
    u.fire = Math.max(70, (game.little ? 160 : 115) - (game.score - 2000) / 60);
  }
}
const zapEnds = o => { const dx = Math.cos(o.angle) * o.len / 2, dy = Math.sin(o.angle) * o.len / 2; return [o.x - dx, o.y - dy, o.x + dx, o.y + dy]; };
function closestOnSeg(px, py, x1, y1, x2, y2) { const vx = x2 - x1, vy = y2 - y1, t = Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / (vx * vx + vy * vy))); return [x1 + vx * t, y1 + vy * t]; }
function distToSeg(px, py, x1, y1, x2, y2) { const c = closestOnSeg(px, py, x1, y1, x2, y2); return Math.hypot(px - c[0], py - c[1]); }

// ---------- Drawing ----------
function drawBackground(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f99a3b'); g.addColorStop(.62, '#fbe0b6'); g.addColorStop(1, '#e9c2a5');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff2d4'; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(772, 95, 52, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(772, 95, 80, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  for (let i = 0; i < 7; i++) { const x = ((i * 230 - t * 1.1) % 1200 + 1200) % 1200 - 120, y = 70 + (i % 3) * 110; cloud(x, y, .8 + (i % 2) * .3); }
  for (let i = 0; i < 9; i++) { const x = ((i * 150 - t * 1.6) % 1350 + 1350) % 1350 - 150; hill(x, 470 + (i % 3) * 10, '#b39ac6'); }
  for (let i = 0; i < 13; i++) { const x = ((i * 115 - t * 2.4) % 1100 + 1100) % 1100 - 80; ctx.fillStyle = '#8f7aae'; roundRect(x, 440 + (i % 3) * 12, 70, 100, 8); ctx.fill(); ctx.fillStyle = '#fbe0b680'; for (let w = 0; w < 3; w++) ctx.fillRect(x + 12 + w * 18, 456 + (i % 3) * 12, 9, 12); }
  ctx.fillStyle = '#59877d'; ctx.fillRect(0, 505, W, 35); ctx.fillStyle = '#476b65'; ctx.fillRect(0, 517, W, 23);
  ctx.fillStyle = '#315b5a'; for (let i = 0; i < 25; i++) ctx.fillRect(((i * 46 - t * 3.2) % 1040 + 1040) % 1040, 524, 20, 6);
}
function cloud(x, y, s) { ctx.fillStyle = '#fff6e6c0'; ctx.beginPath(); ctx.ellipse(x, y, 60 * s, 18 * s, 0, 0, Math.PI * 2); ctx.ellipse(x - 22 * s, y - 12 * s, 28 * s, 20 * s, 0, 0, Math.PI * 2); ctx.ellipse(x + 18 * s, y - 16 * s, 32 * s, 24 * s, 0, 0, Math.PI * 2); ctx.fill(); }
function hill(x, y, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 120, 540); ctx.quadraticCurveTo(x, y - 90, x + 120, 540); ctx.fill(); }
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function drawGear(o) {
  const y = o.y + Math.sin(o.phase) * o.bob, wob = o.hitT ? Math.sin(o.hitT * 1.3) * 5 : 0, r = o.r, teeth = 10, rot = game.t * .04 + o.phase;
  ctx.save(); ctx.translate(o.x + wob, y);
  ctx.shadowColor = o.colors[0]; ctx.shadowBlur = 18;
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const a0 = i * Math.PI / teeth, rr = i % 2 ? r * .82 : r * 1.13; ctx.lineTo(Math.cos(a0 - .13) * rr, Math.sin(a0 - .13) * rr); ctx.lineTo(Math.cos(a0 + .13) * rr, Math.sin(a0 + .13) * rr); }
  ctx.closePath();
  const gr = ctx.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r * 1.15); gr.addColorStop(0, '#fffbe9'); gr.addColorStop(.35, o.colors[0]); gr.addColorStop(1, o.colors[1]);
  ctx.fillStyle = gr; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = '#2b2233'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, Math.PI * 2); ctx.fillStyle = o.colors[1]; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .34, Math.sin(a) * r * .34, r * .09, 0, Math.PI * 2); ctx.fillStyle = '#2b2233'; ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, r * .2, 0, Math.PI * 2); const hub = ctx.createRadialGradient(-3, -3, 1, 0, 0, r * .2); hub.addColorStop(0, '#ffffff'); hub.addColorStop(1, '#9aa3b2'); ctx.fillStyle = hub; ctx.fill(); ctx.stroke();
  if (o.hitT && Math.floor(o.hitT / 3) % 2) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = '#ffffffb0'; ctx.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
}
function drawZap(o) {
  const [x1, y1, x2, y2] = zapEnds(o), wob = o.hitT ? Math.sin(o.hitT * 1.3) * 4 : 0;
  ctx.save(); ctx.translate(wob, 0);
  // electric beam
  const segs = 9;
  for (const [w, c, blur] of [[24, '#ffe25a50', 26], [11, '#ffd23f', 16], [4.5, '#ffffff', 0]]) {
    ctx.beginPath(); ctx.moveTo(x1, y1);
    for (let i = 1; i < segs; i++) { const t = i / segs, nx = -(y2 - y1) / o.len, ny = (x2 - x1) / o.len, j = (Math.sin(game.t * .9 + i * 2.3 + o.phase) * 6) * (w > 10 ? .4 : 1); ctx.lineTo(x1 + (x2 - x1) * t + nx * j, y1 + (y2 - y1) * t + ny * j); }
    ctx.lineTo(x2, y2); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = blur; ctx.stroke();
  }
  ctx.shadowBlur = 0;
  for (const [x, y] of [[x1, y1], [x2, y2]]) {
    ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); const gr = ctx.createRadialGradient(x - 5, y - 6, 2, x, y, 17); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.4, '#7fd0ff'); gr.addColorStop(1, '#2a5fb8'); ctx.fillStyle = gr; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#1d2540'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fillStyle = '#ffe25a'; ctx.fill();
  }
  if (o.hitT && Math.floor(o.hitT / 3) % 2) { ctx.globalAlpha = .6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  ctx.restore();
}
function drawGem(o) {
  ctx.save(); ctx.translate(o.x, o.y + Math.sin(o.phase) * 3); ctx.rotate(Math.sin(o.phase) * .15);
  ctx.shadowColor = '#bff6ff'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(11, -3); ctx.lineTo(0, 14); ctx.lineTo(-11, -3); ctx.closePath();
  const gr = ctx.createLinearGradient(-10, -12, 10, 12); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.4, '#5fe0f0'); gr.addColorStop(1, '#2a8fd0'); ctx.fillStyle = gr; ctx.fill();
  ctx.shadowBlur = 0; ctx.lineWidth = 2.5; ctx.strokeStyle = '#1e4f7a'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-11, -3); ctx.lineTo(11, -3); ctx.moveTo(0, -13); ctx.lineTo(-4, -3); ctx.lineTo(0, 14); ctx.lineTo(4, -3); ctx.closePath(); ctx.strokeStyle = '#ffffff90'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}
function drawStar(o) {
  ctx.save(); ctx.translate(o.x, o.y + Math.sin(o.phase) * 4); ctx.rotate(o.phase * .5);
  ctx.shadowColor = '#fff5b0'; ctx.shadowBlur = 22; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 21; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fillStyle = '#ffe27a'; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = '#b07a1c'; ctx.stroke(); ctx.restore();
}
function drawBook(x, y, s = 1, glow = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow) { const pulse = 1 + Math.sin(game?.t * .15 || 0) * .1; ctx.beginPath(); ctx.arc(0, 0, 34 * pulse, 0, Math.PI * 2); const gr = ctx.createRadialGradient(0, 0, 5, 0, 0, 34 * pulse); gr.addColorStop(0, '#fff6c8'); gr.addColorStop(1, '#ffd45b00'); ctx.fillStyle = gr; ctx.fill(); }
  ctx.lineWidth = 3; ctx.strokeStyle = '#6b3b1a';
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(-12, -18, -26, -14); ctx.lineTo(-26, 14); ctx.quadraticCurveTo(-12, 10, 0, 16); ctx.quadraticCurveTo(12, 10, 26, 14); ctx.lineTo(26, -14); ctx.quadraticCurveTo(12, -18, 0, -12); ctx.closePath();
  ctx.fillStyle = '#c0392b'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(-11, -15, -22, -11); ctx.lineTo(-22, 10); ctx.quadraticCurveTo(-11, 7, 0, 12); ctx.quadraticCurveTo(11, 7, 22, 10); ctx.lineTo(22, -11); ctx.quadraticCurveTo(11, -15, 0, -10); ctx.closePath();
  ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-18, -5 + i * 5); ctx.lineTo(-4, -4 + i * 5); ctx.moveTo(4, -4 + i * 5); ctx.lineTo(18, -5 + i * 5); ctx.stroke(); }
  ctx.strokeStyle = '#e0a526'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 12); ctx.stroke();
  ctx.restore();
}
function drawShot(s) {
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.shadowColor = '#ffe9a0'; ctx.shadowBlur = 14;
  ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = '#b8862e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-9, -11, 18, 22); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1.3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-6, -6 + i * 4); ctx.lineTo(6, -6 + i * 4); ctx.stroke(); }
  ctx.restore();
}
function drawUfo(u) {
  ctx.save(); ctx.translate(u.x, u.y);
  // beam glow under saucer
  const bg = ctx.createLinearGradient(0, 10, 0, 70); bg.addColorStop(0, '#7dff9b55'); bg.addColorStop(1, '#7dff9b00'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-26, 14); ctx.lineTo(26, 14); ctx.lineTo(44, 70); ctx.lineTo(-44, 70); ctx.fill();
  // dome
  ctx.beginPath(); ctx.ellipse(0, -10, 30, 26, 0, Math.PI, 0); const dg = ctx.createLinearGradient(0, -36, 0, -6); dg.addColorStop(0, '#e9fdff'); dg.addColorStop(1, '#6fd6e8'); ctx.fillStyle = dg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1d3550'; ctx.stroke();
  // alien
  ctx.fillStyle = '#5ee07a'; ctx.beginPath(); ctx.ellipse(0, -14, 11, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1d3550'; ctx.beginPath(); ctx.ellipse(-4, -16, 2.6, 3.6, 0, 0, Math.PI * 2); ctx.ellipse(4, -16, 2.6, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  // saucer
  ctx.beginPath(); ctx.ellipse(0, 4, 62, 18, 0, 0, Math.PI * 2); const sg = ctx.createLinearGradient(0, -14, 0, 22); sg.addColorStop(0, '#f4f6fb'); sg.addColorStop(.5, '#a9b4c8'); sg.addColorStop(1, '#5c6782'); ctx.fillStyle = sg; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#1d3550'; ctx.stroke();
  for (let i = 0; i < 6; i++) { const on = Math.floor(game.t / 8 + i) % 3 === 0; ctx.beginPath(); ctx.arc(-45 + i * 18, 7, 4.5, 0, Math.PI * 2); ctx.fillStyle = on ? '#ffe25a' : '#ff6b6b'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = on ? 10 : 0; ctx.fill(); }
  ctx.shadowBlur = 0;
  if (u.flash && Math.floor(u.flash / 3) % 2) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = '#ffffffc0'; ctx.fillRect(-70, -40, 140, 80); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  // hp bar
  if (!u.leaving) { const w = 90; ctx.fillStyle = '#1d3550aa'; roundRect(u.x - w / 2, u.y - 58, w, 9, 4); ctx.fill(); ctx.fillStyle = '#7dff9b'; roundRect(u.x - w / 2 + 1.5, u.y - 56.5, (w - 3) * u.hp / u.max, 6, 3); ctx.fill(); }
}
function drawLaser(l) {
  const a = Math.atan2(l.vy, l.vx); ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(a);
  ctx.shadowColor = '#39ff6a'; ctx.shadowBlur = 14; ctx.fillStyle = '#39ff6a'; roundRect(-13, -3.5, 26, 7, 3.5); ctx.fill(); ctx.fillStyle = '#eaffef'; roundRect(-9, -1.5, 18, 3, 1.5); ctx.fill(); ctx.restore();
}
function drawParticle(a) {
  ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, a.life / 26)); ctx.fillStyle = a.color;
  if (a.kind === 'cloud-puffs') { ctx.beginPath(); ctx.arc(a.x, a.y, 6, 0, Math.PI * 2); ctx.fill(); }
  else if (a.kind === 'heart-sparks') { heartPath(a.x, a.y, 9); ctx.fill(); }
  else if (a.kind === 'page-flutter') { ctx.fillStyle = '#fff3cc'; ctx.fillRect(a.x, a.y, 8, 10); ctx.strokeStyle = a.color; ctx.strokeRect(a.x, a.y, 8, 10); }
  else if (a.kind === 'star-dust') { ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, r = i % 2 ? 3 : 7; ctx.lineTo(a.x + Math.cos(an) * r, a.y + Math.sin(an) * r); } ctx.closePath(); ctx.fill(); }
  else if (a.kind === 'sky-bolt') { ctx.beginPath(); ctx.moveTo(a.x + 5, a.y - 6); ctx.lineTo(a.x - 1, a.y + 1); ctx.lineTo(a.x + 3, a.y + 1); ctx.lineTo(a.x, a.y + 8); ctx.lineTo(a.x + 10, a.y - 2); ctx.lineTo(a.x + 5, a.y - 2); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(a.x, a.y, (a.size || 4) / 2 + 1, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function heartPath(cx, cy, s) { ctx.beginPath(); ctx.moveTo(cx, cy + s * .35); ctx.bezierCurveTo(cx - s * 1.1, cy - s * .35, cx - s * .55, cy - s * 1.05, cx, cy - s * .5); ctx.bezierCurveTo(cx + s * .55, cy - s * 1.05, cx + s * 1.1, cy - s * .35, cx, cy + s * .35); ctx.closePath(); }
function drawHeart(cx, cy, s, mode = 'full') {
  if (mode === 'empty') { heartPath(cx, cy, s); ctx.fillStyle = '#00000030'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff70'; ctx.stroke(); return; }
  heartPath(cx, cy, s); const gr = ctx.createLinearGradient(cx, cy - s, cx, cy + s * .4); gr.addColorStop(0, '#ff6b78'); gr.addColorStop(1, '#d4122f'); ctx.fillStyle = gr; ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = '#5a0b18'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx - s * .38, cy - s * .55, s * .16, s * .1, -.6, 0, Math.PI * 2); ctx.fillStyle = '#ffffffc0'; ctx.fill();
}
function drawHearts() {
  const size = 22, gap = 52, y0 = 40, slots = Math.max(3, game.hearts, ...game.heartFx.map(h => h.i + 1));
  if (game.heartGain) game.heartGain.t += 1;
  for (let i = 0; i < slots; i++) {
    const cx = 34 + i * gap, fx = game.heartFx.find(h => h.i === i);
    if (i < game.hearts) {
      let pulse = game.hearts === 1 ? 1 + Math.sin(game.t * .2) * .08 : 1;
      if (game.heartGain?.i === i && game.heartGain.t < 30) pulse = 1 + Math.sin(game.heartGain.t / 30 * Math.PI) * .6;
      drawHeart(cx, y0, size * pulse);
    } else if (fx && fx.t < 30) {
      // blink, getting bigger
      drawHeart(cx, y0, size, 'empty');
      if (Math.floor(fx.t / 4) % 2 === 0) { ctx.save(); ctx.translate(cx, y0); ctx.scale(1 + fx.t / 60, 1 + fx.t / 60); ctx.translate(-cx, -y0); drawHeart(cx, y0, size); ctx.restore(); }
    } else if (fx) {
      // break apart and fall away
      const k = (fx.t - 30) / 40;
      drawHeart(cx, y0, size, 'empty');
      for (const side of [-1, 1]) {
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.translate(cx + side * (6 + k * 26), y0 + k * k * 70); ctx.rotate(side * k * 1.2);
        ctx.beginPath(); ctx.rect(side < 0 ? -40 : 0, -40, 40, 80); ctx.clip(); drawHeart(0, 0, size); ctx.restore();
      }
    } else drawHeart(cx, y0, size, 'empty');
  }
}
function drawPowerBar() {
  if (game.power <= 0) return;
  const x = 20, y = 74, w = 150;
  drawBook(x + 16, y + 10, .55, false);
  ctx.fillStyle = '#1d3550aa'; roundRect(x + 36, y + 3, w, 14, 7); ctx.fill();
  ctx.fillStyle = '#ffd45b'; roundRect(x + 38, y + 5, (w - 4) * Math.min(1, game.power / 420), 10, 5); ctx.fill();
}
function drawPlayer(p, y, t, g = game) {
  const sheet = runnerSheet(p);
  ctx.save(); ctx.translate(PX, y);
  let rot = Math.max(-.18, Math.min(.18, (g?.vy || 0) * .021));
  if (g?.throwT > 0) rot += g.throwT > 8 ? -.12 : .1;
  if (g?.dying) rot = .5 + (80 - g.dying) * .01;
  ctx.rotate(rot);
  if (g?.invuln > 0 && !g.hurt && Math.floor(t / 5) % 2) ctx.globalAlpha = .6;
  const jet = equippedCosmetic(p, 'jetpack'), acc = equippedCosmetic(p, 'accessory');
  if (jet && jet.id !== 'classic-pack') drawCosmetic(jet, jet.id === 'butterfly-wings' ? -57 : -49, -36, jet.id === 'butterfly-wings' ? 65 : 40, jet.id === 'butterfly-wings' ? 58 : 55);
  const outfit = equippedCosmetic(p, 'outfit')?.id || 'coral-scout', idx = Math.max(0, FLIGHT_OUTFITS.indexOf(outfit));
  const pose = g?.throwT > 0 ? (g.throwT > 8 ? 'windup' : 'release') : null, tsrc = pose && throwSheet(p, pose);
  const src = tsrc || sheet;
  const sw = (src.naturalWidth || src.width) / 4, sh = (src.naturalHeight || src.height) / 2, sx = idx % 4 * sw, sy = Math.floor(idx / 4) * sh;
  const size = src.padded ? 180 : 124;
  // map the release pose so its head lands where the flying head is
  let dx0 = -size / 2, dy0 = -size / 2, dsz = size;
  if (tsrc && pose === 'release') { const P = POSE[p.gender], k = size / 644; dsz = size * P.release.s; dx0 = -size / 2 + (P.flight[0] - P.release.eye[0] * P.release.s) * k; dy0 = -size / 2 + (P.flight[1] - P.release.eye[1] * P.release.s) * k; }
  if ((src.naturalWidth || src.width) > 0) {
    if (g?.hurt > 0 && Math.floor(g.hurt / 4) % 2 === 0) {
      tctx.clearRect(0, 0, 240, 240); tctx.globalCompositeOperation = 'source-over'; tctx.drawImage(src, sx, sy, sw, sh, 0, 0, 240, 240);
      tctx.globalCompositeOperation = 'source-atop'; tctx.fillStyle = 'rgba(255,40,50,.62)'; tctx.fillRect(0, 0, 240, 240);
      ctx.drawImage(tint, dx0, dy0, dsz, dsz);
    } else ctx.drawImage(src, sx, sy, sw, sh, dx0, dy0, dsz, dsz);
  }
  const accIm = acc && accSprite(p.gender, acc.id), meta = window.FLIGHT_ACC;
  if (accIm && ready(accIm) && meta) {
    // eye position for this outfit cell, in half-res padded-cell pixels
    const cw = src.naturalWidth ? src.naturalWidth / 4 : src.width / 4, eye = meta.eyes[p.gender][idx], off = meta[p.gender][acc.id];
    const k = src.padded ? size / cw : size / cw;                         // screen px per sheet px
    const toPadded = src.padded ? 1 : 443 / cw * 0.5;                     // unpadded sheets: map to half-res padded coords
    const ex = src.padded ? eye[0] : (eye[0] * 2 - 100) / (443 / cw), ey = src.padded ? eye[1] : (eye[1] * 2 - 100) / (443 / cw);
    const scaleAcc = src.padded ? k : k * (cw / 443) * 2;
    ctx.drawImage(accIm, -size / 2 + ex * k + off[0] * scaleAcc, -size / 2 + ey * k + off[1] * scaleAcc, accIm.naturalWidth * scaleAcc, accIm.naturalHeight * scaleAcc);
  }
  if (g && g.shine > 0) { ctx.globalAlpha = Math.min(1, g.shine / 30); ctx.strokeStyle = '#ffe473'; ctx.lineWidth = 6; ctx.shadowColor = '#fff3a6'; ctx.shadowBlur = 22; ctx.beginPath(); ctx.arc(0, -6, 62, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
function drawCosmetic(item, x, y, w, h) { const s = cosmeticSprites.get(item.id); if (ready(s)) ctx.drawImage(s, x, y, w, h); }
function drawGame() {
  const p = profile(), g = game, t = g.t;
  ctx.save();
  if (g.shake > 0) ctx.translate((Math.random() - .5) * g.shake, (Math.random() - .5) * g.shake);
  drawBackground(t);
  g.gemList.forEach(drawGem); g.starList.forEach(drawStar);
  g.powerups.forEach(o => drawBook(o.x, o.y + Math.sin(o.phase) * 6));
  g.heartUps.forEach(o => { ctx.save(); const yy = o.y + Math.sin(o.phase) * 6, pulse = 1 + Math.sin(o.phase * 2) * .08; ctx.shadowColor = '#ff6b78'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(o.x, yy, 30, 0, Math.PI * 2); ctx.fillStyle = '#ffffff55'; ctx.fill(); ctx.shadowBlur = 0; drawHeart(o.x, yy + 4, 20 * pulse); ctx.restore(); });
  g.hazards.forEach(o => { if (!o.dead) o.kind === 'gear' ? drawGear(o) : drawZap(o); });
  if (g.ufo) drawUfo(g.ufo);
  g.lasers.forEach(drawLaser);
  g.particles.forEach(drawParticle);
  drawPlayer(p, g.y, t);
  g.shots.forEach(s => { if (!(s.delay > 0)) drawShot(s); });
  for (const r of g.rings) { ctx.save(); ctx.globalAlpha = Math.max(0, r.life / 22); ctx.strokeStyle = r.color; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  for (const o of g.popups) { ctx.save(); ctx.globalAlpha = Math.min(1, o.life / 25); ctx.font = 'bold 22px FavorSans, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#29464a'; ctx.strokeText(o.text, o.x, o.y); ctx.fillStyle = o.color; ctx.fillText(o.text, o.x, o.y); ctx.restore(); }
  ctx.restore();
  drawHearts(); drawPowerBar();
  if (g.hurt > 30) { ctx.fillStyle = `rgba(255,40,50,${(g.hurt - 30) / 30 * .18})`; ctx.fillRect(0, 0, W, H); }
}
function drawIdle() {
  const p = profile(); drawBackground(0);
  drawPlayer(p, 265, 0, null);
  ctx.font = 'bold 22px FavorSans, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#345c67'; ctx.fillText('PRESS START TO FLY', 560, 300); ctx.textAlign = 'left';
}
// Small preview for the dashboard card.
// Dashboard preview: a real Sky Run scene drawn with the game's own art, then copied into the card.
function drawPlayPreview(p) {
  const c = $('#playPreview'); if (!c) return; const S = 3, CX = 110, CY = 110, CW = 500, CH = 281; c.width = CW * S; c.height = CH * S; const x = c.getContext('2d');
  const scene = {
    t: 120, y: 250, vy: -2, hearts: 3, gems: 0, stars: 0, power: 0, throwT: 0, shine: 0, invuln: 0, hurt: 0, shake: 0,
    hazards: [{ kind: 'gear', x: 455, y: 320, r: 30, colors: COLORS_GEAR[2], phase: 1.2, bob: 0 }, { kind: 'zap', x: 560, y: 225, len: 120, angle: Math.PI / 2, spin: 0, phase: 0 }],
    gemList: [0, 1, 2, 3].map(i => ({ x: 310 + i * 40, y: 175 + Math.sin(i * .9) * 12, phase: i })), starList: [{ x: 500, y: 140, phase: 0 }],
    powerups: [], heartUps: [{ x: 560, y: 330, phase: 0 }], shots: [], lasers: [], particles: [], rings: [], popups: [], heartFx: [], ufo: null
  };
  const draw = () => {
    if (game?.running) return;
    const saved = game; game = scene;
    for (let i = 0; i < 18; i++) scene.particles.push({ x: PX - 40 - i * 7, y: scene.y + 24 + (i % 3 - 1) * 5, vx: 0, vy: 0, life: 26 - i, color: equippedCosmetic(p, 'trail')?.colors[0] || '#ffd16a', kind: equippedCosmetic(p, 'trail')?.id || 'spark', size: 5 });
    const main = ctx; ctx = x;   // draw the scene straight into the card at 3× resolution (crisp on phones and retina screens)
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.setTransform(S, 0, 0, S, -CX * S, -CY * S); x.imageSmoothingQuality = 'high';
    try { drawGame(); } finally { ctx = main; game = saved; scene.particles = []; x.setTransform(1, 0, 0, 1, 0, 0); }
    if (!saved) { drawIdle(); }
  };
  draw(); if (window.buildRunnerSheet) buildRunnerSheet(p).then(draw).catch(() => { });
  [sheets.boy, sheets.girl].forEach(s => s.addEventListener('load', draw, { once: true }));
  setTimeout(draw, 1200);
}

// ---------- Controls (no text selection or long-press menus on phones) ----------
const wrap = $('#canvasWrap');
const press = e => { if (e.target.closest('.game-overlay-card')) return; if (!game?.running) return; hold = true; e.preventDefault(); };
const release = () => { hold = false; };
wrap.addEventListener('pointerdown', press);
window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); window.addEventListener('blur', release);
wrap.addEventListener('touchstart', e => { if (!e.target.closest('.game-overlay-card')) e.preventDefault(); }, { passive: false });
$('#gameLayer').addEventListener('contextmenu', e => e.preventDefault());
$('#gameLayer').addEventListener('selectstart', e => e.preventDefault());
window.addEventListener('keydown', e => { if (e.code === 'Space' && !$('#gameLayer').classList.contains('hidden')) { if (game?.running) hold = true; e.preventDefault(); } });
window.addEventListener('keyup', e => { if (e.code === 'Space') hold = false; });
$('#closeGameButton').onclick = closeGame;
const muteBtn = $('#muteButton'), paintMute = () => { muteBtn.textContent = SkyAudio.muted ? '🔇' : '♪'; muteBtn.classList.toggle('off', SkyAudio.muted); };
muteBtn.onclick = () => { SkyAudio.toggleMute(); paintMute(); if (!SkyAudio.muted && game?.running) SkyAudio.scene(game.ufo ? 'ufo' : 'run'); }; paintMute(); window.paintMute = paintMute;
render();
