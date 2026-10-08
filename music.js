// Read My Bible audio: background music (mp3 loops), Sky Run music, sound effects, and per-device settings.
const SkyAudio = (() => {
  const DEFAULTS = { music: true, sfx: true, musicVol: 0.6, sfxVol: 0.8, homeTrack: 'rmb26', runTrack: 'skyrun' };
  let set = { ...DEFAULTS }; try { set = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('rmb-audio2') || '{}') }; } catch { }
  const saveSet = () => { try { localStorage.setItem('rmb-audio2', JSON.stringify(set)); } catch { } };
  const TRACKS = {
    home: { file: 'music/bgm-home.mp3', name: 'Calm adventure' },
    rmb26: { file: 'music/rmb26-loop.mp3', name: 'Read My Bible song (no lyrics)' },
    skyrun: { file: 'music/bgm-skyrun-gentle.mp3', name: 'Sky Run', start: 4 * 4 * 60 / 118, loopStart: 8 * 4 * 60 / 118 },
    ufo: { file: 'music/bgm-ufo-gentle.mp3', name: 'UFO battle', start: 8 * 4 * 60 / 126, loopStart: 8 * 4 * 60 / 126 },
    win: { file: 'music/jingle-win.mp3', name: 'Victory' }
  };
  let ac = null, master, musicGain, sfxGain, chipGain;
  const buffers = {}, loading = {};
  let current = null;  // {id, src, gain}
  let wanted = null;   // track id the page wants playing
  function ctx() {
    if (ac) return ac;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); master = ac.createGain(); master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = set.music ? set.musicVol : 0; musicGain.connect(master);
    sfxGain = ac.createGain(); sfxGain.gain.value = set.sfx ? set.sfxVol * 0.6 : 0; sfxGain.connect(master);
    chipGain = ac.createGain(); chipGain.gain.value = 0.32; chipGain.connect(musicGain);
    return ac;
  }
  function load(id) {
    if (buffers[id]) return Promise.resolve(buffers[id]);
    if (!loading[id]) loading[id] = fetch(TRACKS[id].file).then(r => r.arrayBuffer()).then(b => new Promise((ok, no) => ctx().decodeAudioData(b, ok, no))).then(buf => buffers[id] = buf).catch(() => null);
    return loading[id];
  }
  async function play(id, { loop = true, fade = 0.8 } = {}) {
    wanted = id;
    if (!ctx()) return; if (ac.state === 'suspended') ac.resume().catch(() => { });
    if (current?.id === id) return;
    const buf = await load(id); if (!buf || wanted !== id) return;
    const old = current, src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = buf; src.loop = loop; if (loop) { src.loopStart = TRACKS[id].loopStart || 0.026; src.loopEnd = buf.duration - 0.03; }   // skip mp3 encoder padding for a gapless loop g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(1, ac.currentTime + fade);
    src.connect(g); g.connect(musicGain); src.start(0, TRACKS[id].start || 0);
    current = { id, src, g };
    if (old) { old.g.gain.setTargetAtTime(0.0001, ac.currentTime, fade / 3); setTimeout(() => { try { old.src.stop(); } catch { } }, fade * 1500); }
    if (!loop) src.onended = () => { if (current?.src === src) current = null; };
  }
  function stopMusic(fade = 0.6) { wanted = null; if (!current || !ac) return; const c = current; current = null; c.g.gain.setTargetAtTime(0.0001, ac.currentTime, fade / 3); setTimeout(() => { try { c.src.stop(); } catch { } }, fade * 1500); }
  // The game asks for a "scene"; settings decide which track that means.
  function scene(name) {
    if (name === 'home') return set.homeTrack === 'off' ? stopMusic() : play(set.homeTrack);
    if (name === 'reading') return set.homeTrack === 'off' ? stopMusic() : play(set.homeTrack);   // reading keeps the home song going
    if (name === 'run') return set.runTrack === 'retro' ? (stopMusic(), chip.start()) : play('skyrun');
    if (name === 'ufo') return set.runTrack === 'retro' ? null : play('ufo', { fade: 0.4 });
    if (name === 'none') { chip.stop(); return stopMusic(); }
  }

  // ---------- Retro chiptune (the original Sky Run tune, kept as an option) ----------
  const chip = (() => {
    const BPM = 140, S16 = 60 / BPM / 4, N = n => 440 * Math.pow(2, (n - 69) / 12);
    const ROOTS = [48, 43, 45, 41], CHORDS = [[60, 64, 67], [59, 62, 67], [60, 64, 69], [60, 65, 69]];
    const LEAD = [[72, 0, 76, 0, 79, 0, 76, 79, 81, 0, 79, 0, 76, 0, 74, 0], [74, 0, 79, 0, 83, 0, 81, 79, 77, 0, 74, 0, 79, 0, 0, 0], [76, 0, 81, 0, 84, 0, 83, 81, 79, 0, 76, 0, 81, 0, 79, 0], [77, 0, 76, 0, 74, 0, 72, 74, 77, 0, 79, 0, 81, 0, 83, 0], [84, 0, 0, 83, 81, 0, 79, 0, 76, 0, 79, 0, 84, 0, 0, 0], [83, 0, 0, 81, 79, 0, 74, 0, 79, 0, 83, 0, 86, 0, 0, 0], [84, 0, 83, 0, 81, 0, 76, 0, 81, 0, 84, 0, 88, 0, 86, 0], [84, 0, 81, 0, 77, 0, 81, 0, 84, 83, 81, 79, 77, 76, 74, 72]];
    let timer = null, step = 0, next = 0;
    function sched(i, t) {
      const bar = Math.floor(i / 16) % 8, s = i % 16, ch = bar % 4, d = chipGain;
      if (s % 4 === 0) tone(d, 'sine', 150, t, 0.18, 0.9, 45);
      if (s === 4 || s === 12) noise(d, t, 0.12, 0.35, 1800);
      if (s % 2 === 1) noise(d, t, 0.04, 0.12, 7000);
      if (s % 2 === 0) tone(d, 'triangle', N(ROOTS[ch] + (s % 4 === 2 ? 12 : 0)), t, S16 * 1.8, 0.5);
      if (s % 4 === 2) CHORDS[ch].forEach(n => tone(d, 'square', N(n), t, S16 * 1.2, 0.05));
      const m = LEAD[bar][s]; if (m) tone(d, 'square', N(m), t, S16 * 1.7, 0.12);
    }
    return {
      start() { if (!ctx() || timer) return; ac.resume().catch(() => { }); step = 0; next = ac.currentTime + 0.05; timer = setInterval(() => { while (next < ac.currentTime + 0.12) { sched(step++, next); next += S16; } }, 25); },
      stop() { clearInterval(timer); timer = null; }
    };
  })();

  // ---------- Synth helpers for sound effects ----------
  function tone(dest, type, freq, t, dur, vol, slideTo) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(dest, t, dur, vol, hp) {
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02);
  }
  const SFX = {
    // Sky Run
    gem: (d, t) => { tone(d, 'square', 1318, t, 0.06, 0.15); tone(d, 'square', 1760, t + 0.05, 0.1, 0.15); },
    star: (d, t) => [1047, 1319, 1568, 2093].forEach((f, i) => tone(d, 'triangle', f, t + i * 0.06, 0.18, 0.25)),
    hit: (d, t) => { tone(d, 'sawtooth', 220, t, 0.3, 0.35, 70); noise(d, t, 0.2, 0.4, 400); },
    power: (d, t) => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(d, 'square', f, t + i * 0.05, 0.14, 0.14)),
    throw: (d, t) => { noise(d, t, 0.1, 0.25, 2500); tone(d, 'triangle', 600, t, 0.12, 0.12, 1200); },
    smash: (d, t) => { noise(d, t, 0.25, 0.4, 900); tone(d, 'square', 300, t, 0.2, 0.12, 90); },
    ufo: (d, t) => { tone(d, 'sine', 300, t, 0.9, 0.2, 900); tone(d, 'sine', 900, t + 0.45, 0.9, 0.15, 300); },
    laser: (d, t) => tone(d, 'square', 1400, t, 0.12, 0.06, 500),
    over: (d, t) => [659, 587, 523, 392].forEach((f, i) => tone(d, 'triangle', f, t + i * 0.16, 0.3, 0.3)),
    // App / UI
    tap: (d, t) => tone(d, 'sine', 880, t, 0.05, 0.12, 660),
    open: (d, t) => { noise(d, t, 0.12, 0.08, 3000); tone(d, 'sine', 520, t, 0.12, 0.08, 780); },
    page: (d, t) => { noise(d, t, 0.18, 0.12, 2200); noise(d, t + 0.09, 0.12, 0.08, 4000); },
    correct: (d, t) => { tone(d, 'triangle', 784, t, 0.12, 0.3); tone(d, 'triangle', 1175, t + 0.09, 0.22, 0.3); },
    wrong: (d, t) => { tone(d, 'triangle', 330, t, 0.16, 0.25, 300); tone(d, 'triangle', 262, t + 0.13, 0.25, 0.22, 240); },
    unlock: (d, t) => [784, 988, 1175, 1568].forEach((f, i) => { tone(d, 'triangle', f, t + i * 0.08, 0.35, 0.22); tone(d, 'sine', f * 2, t + i * 0.08, 0.2, 0.06); }),
    flame: (d, t) => { noise(d, t, 0.5, 0.18, 600); tone(d, 'sine', 180, t, 0.4, 0.15, 420); },
    equip: (d, t) => { tone(d, 'sine', 660, t, 0.08, 0.18); tone(d, 'sine', 990, t + 0.06, 0.12, 0.18); },
    place: (d, t) => tone(d, 'sine', 240, t, 0.1, 0.25, 160),
    heart: (d, t) => [659, 880, 1109, 1319].forEach((f, i) => tone(d, 'sine', f, t + i * 0.06, 0.22, 0.25)),
    bonus: (d, t) => [1319, 1568, 1976, 2637].forEach((f, i) => tone(d, 'sine', f, t + i * 0.07, 0.3, 0.16)),
  };
  return {
    TRACKS, scene, chip,
    get settings() { return { ...set }; },
    update(changes) {
      Object.assign(set, changes); saveSet();
      if (ac) { musicGain.gain.setTargetAtTime(set.music ? set.musicVol : 0, ac.currentTime, 0.05); sfxGain.gain.setTargetAtTime(set.sfx ? set.sfxVol * 0.6 : 0, ac.currentTime, 0.05); }
    },
    unlock() { if (ctx() && ac.state === 'suspended') ac.resume().catch(() => { }); },
    // compatibility with the Sky Run code
    start() { scene('run'); }, stop() { chip.stop(); },
    get muted() { return !set.music && !set.sfx; },
    toggleMute() { const on = this.muted; this.update({ music: on, sfx: on }); return !on; },
    sfx(name) { if (!set.sfx || !SFX[name] || !ctx()) return; if (ac.state === 'suspended') ac.resume().catch(() => { }); SFX[name](sfxGain, ac.currentTime); },
    jingle() { if (set.music && ctx()) { load('win').then(buf => { if (!buf) return; const s = ac.createBufferSource(), g = ac.createGain(); g.gain.value = 1.1; s.buffer = buf; s.connect(g); g.connect(sfxGain.gain.value ? master : musicGain); s.start(); }); } else this.sfx('unlock'); },
    preload(ids) { ids.forEach(id => ctx() && load(id)); }
  };
})();
