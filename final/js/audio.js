// ============ ÁUDIO (Web Audio API) ============
// Todos os sons são gerados por síntese — não precisa de arquivos

function getAudioCtx() {
  if (!Estado.audioCtx) {
    Estado.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (Estado.audioCtx.state === 'suspended') Estado.audioCtx.resume();
  return Estado.audioCtx;
}

function tocarTom(freq, dur, type = 'sine', volume = 0.15, delay = 0) {
  if (!Estado.somAtivado) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const start = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.start(start);
    osc.stop(start + dur);
  } catch (e) { console.warn('[audio] Erro:', e); }
}

function somAcerto() {
  tocarTom(523.25, 0.15, 'sine', 0.18, 0);
  tocarTom(659.25, 0.15, 'sine', 0.18, 0.08);
  tocarTom(783.99, 0.20, 'sine', 0.18, 0.16);
  tocarTom(1046.5, 0.35, 'sine', 0.20, 0.24);
}

function somErro() {
  tocarTom(220, 0.15, 'sawtooth', 0.12, 0);
  tocarTom(185, 0.20, 'sawtooth', 0.12, 0.10);
  tocarTom(138.6, 0.35, 'sawtooth', 0.14, 0.22);
}

function somClique() {
  tocarTom(880, 0.06, 'square', 0.06, 0);
}

function somCombo(nivel) {
  const base = 523.25 * Math.pow(1.12, Math.min(nivel, 8));
  tocarTom(base, 0.1, 'triangle', 0.15, 0);
  tocarTom(base * 1.5, 0.15, 'triangle', 0.15, 0.08);
}

function somVitoria() {
  const notas = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
  notas.forEach((f, i) => tocarTom(f, 0.25, 'sine', 0.18, i * 0.13));
  notas.forEach((f, i) => tocarTom(f * 0.5, 0.25, 'triangle', 0.08, i * 0.13));
}

function somDerrota() {
  const notas = [392, 349.23, 293.66, 220];
  notas.forEach((f, i) => tocarTom(f, 0.4, 'sine', 0.15, i * 0.22));
}

function somTempoEsgotado() {
  tocarTom(180, 0.3, 'sawtooth', 0.18, 0);
  tocarTom(140, 0.3, 'sawtooth', 0.18, 0.15);
  tocarTom(100, 0.5, 'sawtooth', 0.18, 0.3);
}

function somTique() {
  tocarTom(1200, 0.04, 'square', 0.04, 0);
}