// Sky Run music + sound effects: an original upbeat chiptune made with Web Audio (no audio files, no licensing).
const SkyAudio = (() => {
  let ac = null, master = null, musicGain = null, sfxGain = null, timer = null, step = 0, nextTime = 0, playing = false;
  let muted = false; try { muted = localStorage.getItem('rmb-muted') === '1'; } catch { }
  const BPM = 140, S16 = 60 / BPM / 4;
  const N = n => 440 * Math.pow(2, (n - 69) / 12);       // MIDI note → Hz
  // 4 chords, 1 bar each: C  G  Am  F  (bright, hopeful)
  const ROOTS = [48, 43, 45, 41], CHORDS = [[60, 64, 67], [59, 62, 67], [60, 64, 69], [60, 65, 69]];
  // Lead melody, 16 steps per bar, 0 = rest
  const LEAD = [
    [72, 0, 76, 0, 79, 0, 76, 79, 81, 0, 79, 0, 76, 0, 74, 0],
    [74, 0, 79, 0, 83, 0, 81, 79, 77, 0, 74, 0, 79, 0, 0, 0],
    [76, 0, 81, 0, 84, 0, 83, 81, 79, 0, 76, 0, 81, 0, 79, 0],
    [77, 0, 76, 0, 74, 0, 72, 74, 77, 0, 79, 0, 81, 0, 83, 0],
    [84, 0, 0, 83, 81, 0, 79, 0, 76, 0, 79, 0, 84, 0, 0, 0],
    [83, 0, 0, 81, 79, 0, 74, 0, 79, 0, 83, 0, 86, 0, 0, 0],
    [84, 0, 83, 0, 81, 0, 76, 0, 81, 0, 84, 0, 88, 0, 86, 0],
    [84, 0, 81, 0, 77, 0, 81, 0, 84, 83, 81, 79, 77, 76, 74, 72]
  ];
  function ctx() {
    if (ac) return ac;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
    sfxGain = ac.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    return ac;
  }
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
  function kick(dest, t) { tone(dest, 'sine', 150, t, 0.18, 0.9, 45); }
  function schedule(i, t, dest) {
    const bar = Math.floor(i / 16) % 8, s = i % 16, ch = bar % 4;
    // drums
    if (s % 4 === 0) kick(dest, t);
    if (s === 4 || s === 12) noise(dest, t, 0.12, 0.35, 1800);
    if (s % 2 === 1) noise(dest, t, 0.04, 0.12, 7000);
    // bass: root, octave bounce
    if (s % 2 === 0) tone(dest, 'triangle', N(ROOTS[ch] + (s % 4 === 2 ? 12 : 0)), t, S16 * 1.8, 0.5);
    // chord stabs on the off-beats
    if (s % 4 === 2) CHORDS[ch].forEach(n => tone(dest, 'square', N(n), t, S16 * 1.2, 0.05));
    // lead
    const m = LEAD[bar][s]; if (m) tone(dest, 'square', N(m), t, S16 * 1.7, 0.12);
    // sparkle arpeggio in the second half
    if (bar >= 4 && s % 2 === 1) tone(dest, 'triangle', N(CHORDS[ch][(s >> 1) % 3] + 12), t, S16 * 0.9, 0.06);
  }
  function tick() {
    while (nextTime < ac.currentTime + 0.12) { schedule(step, nextTime, musicGain); step++; nextTime += S16; }
  }
  return {
    start() { if (!ctx()) return; ac.resume(); if (playing) return; playing = true; step = 0; nextTime = ac.currentTime + 0.05; musicGain.gain.setTargetAtTime(0.32, ac.currentTime, 0.05); timer = setInterval(tick, 25); tick(); },
    stop() { if (!playing) return; playing = false; clearInterval(timer); if (musicGain) musicGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { if (!playing && musicGain) musicGain.gain.value = 0.32; }, 400); },
    get muted() { return muted; },
    toggleMute() { muted = !muted; try { localStorage.setItem('rmb-muted', muted ? '1' : '0'); } catch { } if (master) master.gain.setTargetAtTime(muted ? 0 : 0.8, ac.currentTime, 0.02); return muted; },
    sfx(name) {
      if (!ac || muted) return; const t = ac.currentTime, d = sfxGain;
      if (name === 'gem') { tone(d, 'square', 1318, t, 0.06, 0.15); tone(d, 'square', 1760, t + 0.05, 0.1, 0.15); }
      else if (name === 'star') [1047, 1319, 1568, 2093].forEach((f, i) => tone(d, 'triangle', f, t + i * 0.06, 0.18, 0.25));
      else if (name === 'hit') { tone(d, 'sawtooth', 220, t, 0.3, 0.35, 70); noise(d, t, 0.2, 0.4, 400); }
      else if (name === 'power') [523, 659, 784, 1047, 1319].forEach((f, i) => tone(d, 'square', f, t + i * 0.05, 0.14, 0.14));
      else if (name === 'throw') { noise(d, t, 0.1, 0.25, 2500); tone(d, 'triangle', 600, t, 0.12, 0.12, 1200); }
      else if (name === 'smash') { noise(d, t, 0.25, 0.4, 900); tone(d, 'square', 300, t, 0.2, 0.12, 90); }
      else if (name === 'ufo') { tone(d, 'sine', 300, t, 0.9, 0.2, 900); tone(d, 'sine', 900, t + 0.45, 0.9, 0.15, 300); }
      else if (name === 'laser') tone(d, 'square', 1400, t, 0.12, 0.06, 500);
      else if (name === 'over') [659, 587, 523, 392].forEach((f, i) => tone(d, 'triangle', f, t + i * 0.16, 0.3, 0.3));
    },
    // Renders a loop to an AudioBuffer (used to make a preview file).
    async render(seconds) {
      const OC = window.OfflineAudioContext; const o = new OC(2, 44100 * seconds, 44100); const save = ac; ac = o;
      const g = o.createGain(); g.gain.value = 0.32; g.connect(o.destination);
      for (let i = 0, t = 0; t < seconds; i++, t += S16) schedule(i, t, g);
      const buf = await o.startRendering(); ac = save; return buf;
    }
  };
})();
