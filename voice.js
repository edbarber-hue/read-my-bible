// Voice messages: record with the microphone, keep them on this device (IndexedDB).
const VoiceStore = (() => {
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((ok, no) => { const r = indexedDB.open('rmb-voice', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }));
  const tx = (mode, fn) => db().then(d => new Promise((ok, no) => { const t = d.transaction('clips', mode), s = t.objectStore('clips'), q = fn(s); t.oncomplete = () => ok(q?.result); t.onerror = () => no(t.error); }));
  return { put: (id, blob) => tx('readwrite', s => s.put(blob, id)), get: id => tx('readonly', s => s.get(id)), del: id => tx('readwrite', s => s.delete(id)) };
})();
const Recorder = (() => {
  let rec = null, chunks = [], stream = null;
  const supported = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg'].find(t => MediaRecorder.isTypeSupported?.(t)) || '';
    rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined); chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data); rec.start();
  }
  function stop() {
    return new Promise(ok => { if (!rec) return ok(null); rec.onstop = () => { const b = new Blob(chunks, { type: rec.mimeType || 'audio/webm' }); stream?.getTracks().forEach(t => t.stop()); rec = null; ok(b); }; rec.stop(); });
  }
  function cancel() { try { rec?.stop(); } catch { } stream?.getTracks().forEach(t => t.stop()); rec = null; }
  return { supported, start, stop, cancel, get recording() { return !!rec; } };
})();
