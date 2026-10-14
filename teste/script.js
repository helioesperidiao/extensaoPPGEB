// ============ ESTADO ============
let quizData = null;
let sobreData = null;
let currentIndex = 0;
let score = 0;
let answered = false;
let selectedIndex = null;
let synth = window.speechSynthesis;
let vozesDisponiveis = [];
let combo = 0;
let audioCtx = null;

let timerInterval = null;
let timeLeft = 0;

let somAtivado = true;

let configAtiva = {
  voiceName: null,
  voiceLang: null,
  rate: 1,
  pitch: 1,
  volume: 1,
  timerAtivo: true,
  tempoPergunta: 30
};
let configTemp = { ...configAtiva };

const STORAGE_KEY = 'quizVoiceConfig';
const STORAGE_SOM = 'quizSomAtivado';

// ============ ELEMENTOS ============
const loadingEl = document.getElementById('loading');
const quizMain = document.getElementById('quizMain');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const confirmBtn = document.getElementById('confirmBtn');
const progressInfo = document.getElementById('progressInfo');
const progressFill = document.getElementById('progressFill');
const scoreBadge = document.getElementById('scoreBadge');
const speakBtn = document.getElementById('speakBtn');
const quizContent = document.getElementById('quizContent');
const resultScreen = document.getElementById('resultScreen');
const settingsBtn = document.getElementById('settingsBtn');
const aboutBtn = document.getElementById('aboutBtn');
const soundBtn = document.getElementById('soundBtn');
const quizContainer = document.getElementById('quizContainer');
const timerBar = document.getElementById('timerBar');
const timerFill = document.getElementById('timerFill');
const timerLabel = document.getElementById('timerLabel');

const settingsModal = document.getElementById('settingsModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const resetConfigBtn = document.getElementById('resetConfigBtn');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const pitchRange = document.getElementById('pitchRange');
const volumeRange = document.getElementById('volumeRange');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const volumeValue = document.getElementById('volumeValue');
const testVoiceBtn = document.getElementById('testVoiceBtn');
const timerAtivoCheck = document.getElementById('timerAtivoCheck');
const tempoRange = document.getElementById('tempoRange');
const tempoValue = document.getElementById('tempoValue');
const tempoFieldGroup = document.getElementById('tempoFieldGroup');
const toast = document.getElementById('toast');

const aboutModal = document.getElementById('aboutModal');
const aboutCloseBtn = document.getElementById('aboutCloseBtn');
const aboutOkBtn = document.getElementById('aboutOkBtn');
const aboutBody = document.getElementById('aboutBody');

console.log('[DEBUG] Elementos carregados:', {
  nextBtn: nextBtn ? 'OK' : 'NULL',
  confirmBtn: confirmBtn ? 'OK' : 'NULL',
  options: optionsContainer ? 'OK' : 'NULL',
  questionText: questionText ? 'OK' : 'NULL'
});

// ============ ÁUDIO ============
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tocarTom(freq, dur, type = 'sine', volume = 0.15, delay = 0) {
  if (!somAtivado) return;
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
  } catch (e) { console.warn('Erro áudio:', e); }
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
function somClique() { tocarTom(880, 0.06, 'square', 0.06, 0); }
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
function somTique() { tocarTom(1200, 0.04, 'square', 0.04, 0); }

// ============ LOCALSTORAGE ============
function carregarConfig() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) configAtiva = { ...configAtiva, ...JSON.parse(salvo) };
  } catch (e) { console.warn(e); }
}
function salvarConfig() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(configAtiva)); } catch (e) { console.warn(e); }
}
function carregarSom() {
  try {
    const salvo = localStorage.getItem(STORAGE_SOM);
    if (salvo !== null) somAtivado = salvo === 'true';
  } catch (e) { console.warn(e); }
  atualizarBotaoSom();
}
function salvarSom() {
  try { localStorage.setItem(STORAGE_SOM, somAtivado ? 'true' : 'false'); } catch (e) { console.warn(e); }
}
function atualizarBotaoSom() {
  if (!soundBtn) return;
  if (somAtivado) {
    soundBtn.textContent = '🔊';
    soundBtn.classList.remove('muted');
    soundBtn.title = 'Som ligado — clique para desligar';
  } else {
    soundBtn.textContent = '🔇';
    soundBtn.classList.add('muted');
    soundBtn.title = 'Som desligado — clique para ligar';
  }
}
function mostrarToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ============ VOZES ============
function listarVozes() {
  const vozes = speechSynthesis.getVoices();
  if (vozes.length === 0) return;

  const ptBR = vozes.filter(v => v.lang === 'pt-BR');
  const ptOutros = vozes.filter(v => v.lang.startsWith('pt') && v.lang !== 'pt-BR');
  const outras = vozes.filter(v => !v.lang.startsWith('pt'));
  vozesDisponiveis = [...ptBR, ...ptOutros, ...outras];

  if (voiceSelect) {
    voiceSelect.innerHTML = '';
    vozesDisponiveis.forEach((voz, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${voz.name} — ${voz.lang}`;
      voiceSelect.appendChild(opt);
    });

    if (settingsModal && settingsModal.classList.contains('show')) {
      selecionarVozNoSelect(configTemp.voiceName, configTemp.voiceLang);
    } else {
      selecionarVozNoSelect(configAtiva.voiceName, configAtiva.voiceLang);
    }
  }
}

function selecionarVozNoSelect(name, lang) {
  if (!voiceSelect) return;
  if (!name) {
    const idx = vozesDisponiveis.findIndex(v => v.lang === 'pt-BR');
    voiceSelect.selectedIndex = idx >= 0 ? idx : 0;
    return;
  }
  let idx = vozesDisponiveis.findIndex(v => v.name === name && v.lang === lang);
  if (idx === -1) idx = vozesDisponiveis.findIndex(v => v.name === name);
  if (idx === -1) idx = vozesDisponiveis.findIndex(v => v.lang === 'pt-BR');
  voiceSelect.selectedIndex = idx >= 0 ? idx : 0;
}

function obterVozAtiva() {
  if (!configAtiva.voiceName) return vozesDisponiveis.find(v => v.lang === 'pt-BR') || vozesDisponiveis[0] || null;
  return vozesDisponiveis.find(v => v.name === configAtiva.voiceName && v.lang === configAtiva.voiceLang)
      || vozesDisponiveis.find(v => v.name === configAtiva.voiceName)
      || vozesDisponiveis.find(v => v.lang === 'pt-BR')
      || vozesDisponiveis[0] || null;
}
function obterVozTemp() { return voiceSelect ? (vozesDisponiveis[voiceSelect.selectedIndex] || null) : null; }

function falar(texto, opts = {}) {
  if (!('speechSynthesis' in window)) return null;
  if (!somAtivado) return null;
  const cfg = opts.useTemp ? configTemp : configAtiva;
  const voz = opts.useTemp ? obterVozTemp() : obterVozAtiva();
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(texto);
  if (voz) utter.voice = voz;
  utter.lang = voz ? voz.lang : 'pt-BR';
  utter.rate = cfg.rate;
  utter.pitch = cfg.pitch;
  utter.volume = cfg.volume;
  if (opts.onend) utter.onend = opts.onend;
  synth.speak(utter);
  return utter;
}

// ============ EFEITOS VISUAIS ============
function screenShake() {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
}
function screenFlash(color) {
  document.body.classList.add('flash-' + color);
  setTimeout(() => document.body.classList.remove('flash-' + color), 600);
}
function celebraContainer() {
  if (!quizContainer) return;
  quizContainer.classList.add('celebrating');
  setTimeout(() => quizContainer.classList.remove('celebrating'), 700);
}
function tremeContainer() {
  if (!quizContainer) return;
  quizContainer.classList.add('failing');
  setTimeout(() => quizContainer.classList.remove('failing'), 500);
}
function flashTimeUp() {
  if (!quizContainer) return;
  quizContainer.classList.add('time-up');
  setTimeout(() => quizContainer.classList.remove('time-up'), 1400);
}

// ============ PARTÍCULAS ============
function explodirParticulas(x, y, qtd = 25, cores = null) {
  const palette = cores || ['#00498B', '#0677CC', '#00BDB9', '#FBAB30', '#96100E', '#D66C25'];
  for (let i = 0; i < qtd; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const cor = palette[Math.floor(Math.random() * palette.length)];
    p.style.background = cor;
    p.style.boxShadow = `0 0 15px ${cor}, 0 0 30px ${cor}`;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    const angulo = Math.random() * Math.PI * 2;
    const dist = Math.random() * 220 + 80;
    p.style.setProperty('--tx', Math.cos(angulo) * dist + 'px');
    p.style.setProperty('--ty', Math.sin(angulo) * dist + 'px');
    const size = Math.random() * 10 + 6;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.animationDuration = (Math.random() * 0.5 + 0.7) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

function burstConfetti(amount) {
  const colors = ['#00498B', '#0677CC', '#00BDB9', '#FBAB30', '#96100E', '#D66C25'];
  for (let i = 0; i < amount; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.animationDuration = (Math.random() * 2.5 + 2) + 's';
    conf.style.animationDelay = (Math.random() * 0.8) + 's';
    conf.style.animationName = 'fall';
    conf.style.animationTimingFunction = 'ease-in';
    conf.style.animationFillMode = 'forwards';
    conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    const size = Math.random() * 10 + 6;
    conf.style.width = conf.style.height = size + 'px';
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 5000);
  }
}

function mostrarPontosFlutuantes(x, y, texto, cor = '#38ef7d') {
  const el = document.createElement('div');
  el.className = 'float-points';
  el.textContent = texto;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = cor;
  el.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function mostrarCombo(nivel) {
  const el = document.createElement('div');
  el.className = 'combo-badge show';
  el.textContent = `🔥 COMBO x${nivel}!`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// ============ TIMER ============
function iniciarTimer() {
  pararTimer();

  if (!configAtiva.timerAtivo) {
    if (timerBar) timerBar.style.display = 'none';
    if (timerLabel) timerLabel.style.display = 'none';
    return;
  }
  if (timerBar) timerBar.style.display = 'block';
  if (timerLabel) timerLabel.style.display = 'block';

  timeLeft = configAtiva.tempoPergunta;
  atualizarTimerUI();

  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      atualizarTimerUI();
      pararTimer();
      tempoEsgotado();
    } else {
      atualizarTimerUI();
      if (timeLeft <= 5 && Math.abs((timeLeft * 10) % 10) < 0.5) {
        somTique();
      }
    }
  }, 100);
}

function pararTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function atualizarTimerUI() {
  if (!configAtiva.timerAtivo) return;
  if (!timerFill || !timerLabel) return;
  const pct = (timeLeft / configAtiva.tempoPergunta) * 100;
  timerFill.style.width = pct + '%';
  timerLabel.textContent = `⏱️ ${Math.ceil(timeLeft)}s`;

  timerFill.classList.remove('warning', 'danger');
  timerLabel.classList.remove('warning', 'danger');

  if (pct <= 20) {
    timerFill.classList.add('danger');
    timerLabel.classList.add('danger');
  } else if (pct <= 50) {
    timerFill.classList.add('warning');
    timerLabel.classList.add('warning');
  }
}

function tempoEsgotado() {
  if (answered) return;
  answered = true;
  combo = 0;

  synth.cancel();
  somTempoEsgotado();
  flashTimeUp();
  screenFlash('red');
  screenShake();
  tremeContainer();

  const q = quizData.questions[currentIndex];
  const allOptions = document.querySelectorAll('.option');

  allOptions.forEach(o => {
    o.classList.add('disabled');
    o.classList.remove('selected');
  });

  allOptions[q.correct].classList.add('correct');
  allOptions[q.correct].querySelector('span').insertAdjacentHTML('afterend', '<span class="icon">✔</span>');

  setTimeout(() => {
    falar(`Tempo esgotado! A resposta correta é: ${q.options[q.correct]}`);
  }, 400);

  progressFill.style.width = `${((currentIndex + 1) / quizData.questions.length) * 100}%`;

  // Esconde confirmar
  const btnConfirm = document.getElementById('confirmBtn');
  if (btnConfirm) {
    btnConfirm.style.display = 'none';
    btnConfirm.disabled = true;
  }

  // Mostra próxima
  const btnNext = document.getElementById('nextBtn');
  if (btnNext) {
    btnNext.textContent = currentIndex === quizData.questions.length - 1 ? 'Ver Resultado 🏁' : 'Próxima ➜';
    btnNext.disabled = false;
    btnNext.style.display = 'block';
    btnNext.style.opacity = '1';
    btnNext.style.pointerEvents = 'auto';
    btnNext.style.transform = 'translateY(0)';
  }
}

// ============ MODAL CONFIGURAÇÕES ============
function abrirModal() {
  configTemp = { ...configAtiva };
  selecionarVozNoSelect(configTemp.voiceName, configTemp.voiceLang);
  if (rateRange) rateRange.value = configTemp.rate;
  if (pitchRange) pitchRange.value = configTemp.pitch;
  if (volumeRange) volumeRange.value = configTemp.volume;
  if (timerAtivoCheck) timerAtivoCheck.checked = configTemp.timerAtivo;
  if (tempoRange) tempoRange.value = configTemp.tempoPergunta;
  if (tempoFieldGroup) tempoFieldGroup.classList.toggle('disabled', !configTemp.timerAtivo);
  atualizarLabels();
  if (settingsModal) settingsModal.classList.add('show');
  somClique();
}

function fecharModal() {
  if (settingsModal) settingsModal.classList.remove('show');
  synth.cancel();
}

function atualizarLabels() {
  if (rateValue && rateRange) rateValue.textContent = parseFloat(rateRange.value).toFixed(2) + 'x';
  if (pitchValue && pitchRange) pitchValue.textContent = parseFloat(pitchRange.value).toFixed(2);
  if (volumeValue && volumeRange) volumeValue.textContent = Math.round(volumeRange.value * 100) + '%';
  if (tempoValue && tempoRange) tempoValue.textContent = tempoRange.value + 's';
}

if (settingsBtn) settingsBtn.addEventListener('click', abrirModal);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
if (cancelBtn) cancelBtn.addEventListener('click', fecharModal);
if (settingsModal) settingsModal.addEventListener('click', e => { if (e.target === settingsModal) fecharModal(); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (settingsModal && settingsModal.classList.contains('show')) fecharModal();
    if (aboutModal && aboutModal.classList.contains('show')) fecharAbout();
  }
});

if (voiceSelect) voiceSelect.addEventListener('change', () => {
  const voz = obterVozTemp();
  if (voz) { configTemp.voiceName = voz.name; configTemp.voiceLang = voz.lang; }
  somClique();
});
if (rateRange) rateRange.addEventListener('input', () => { configTemp.rate = parseFloat(rateRange.value); atualizarLabels(); });
if (pitchRange) pitchRange.addEventListener('input', () => { configTemp.pitch = parseFloat(pitchRange.value); atualizarLabels(); });
if (volumeRange) volumeRange.addEventListener('input', () => { configTemp.volume = parseFloat(volumeRange.value); atualizarLabels(); });

if (timerAtivoCheck) timerAtivoCheck.addEventListener('change', () => {
  configTemp.timerAtivo = timerAtivoCheck.checked;
  if (tempoFieldGroup) tempoFieldGroup.classList.toggle('disabled', !configTemp.timerAtivo);
  somClique();
});
if (tempoRange) tempoRange.addEventListener('input', () => {
  configTemp.tempoPergunta = parseInt(tempoRange.value, 10);
  atualizarLabels();
});

if (testVoiceBtn) testVoiceBtn.addEventListener('click', () => {
  const voz = obterVozTemp();
  if (voz) { configTemp.voiceName = voz.name; configTemp.voiceLang = voz.lang; }
  falar('Esta é uma demonstração da voz escolhida. Um, dois, três, testando.', { useTemp: true });
});

if (resetConfigBtn) resetConfigBtn.addEventListener('click', () => {
  configTemp = {
    voiceName: null,
    voiceLang: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    timerAtivo: true,
    tempoPergunta: 30
  };
  selecionarVozNoSelect(null, null);
  if (rateRange) rateRange.value = 1;
  if (pitchRange) pitchRange.value = 1;
  if (volumeRange) volumeRange.value = 1;
  if (timerAtivoCheck) timerAtivoCheck.checked = true;
  if (tempoRange) tempoRange.value = 30;
  if (tempoFieldGroup) tempoFieldGroup.classList.remove('disabled');
  atualizarLabels();
  somClique();
});

if (saveBtn) saveBtn.addEventListener('click', () => {
  const voz = obterVozTemp();
  if (voz) { configTemp.voiceName = voz.name; configTemp.voiceLang = voz.lang; }
  configAtiva = { ...configTemp };
  salvarConfig();
  fecharModal();
  mostrarToast('✓ Configurações salvas!');
  somAcerto();
  if (!answered && quizData) iniciarTimer();
});

// ============ BOTÃO SOM ============
if (soundBtn) soundBtn.addEventListener('click', () => {
  somAtivado = !somAtivado;
  salvarSom();
  atualizarBotaoSom();
  if (somAtivado) {
    somClique();
    mostrarToast('🔊 Som ligado');
  } else {
    synth.cancel();
    mostrarToast('🔇 Som desligado');
  }
});

// ============ MODAL SOBRE ============
function abrirAbout() {
  if (aboutModal) aboutModal.classList.add('show');
  somClique();
}
function fecharAbout() {
  if (aboutModal) aboutModal.classList.remove('show');
}
if (aboutBtn) aboutBtn.addEventListener('click', abrirAbout);
if (aboutCloseBtn) aboutCloseBtn.addEventListener('click', fecharAbout);
if (aboutOkBtn) aboutOkBtn.addEventListener('click', fecharAbout);
if (aboutModal) aboutModal.addEventListener('click', e => { if (e.target === aboutModal) fecharAbout(); });

function iniciais(nome) {
  return nome.trim().split(/\s+/).slice(0, 2)
    .map(p => p[0] ? p[0].toUpperCase() : '').join('');
}

function criarLinks(pessoa) {
  const links = [];
  if (pessoa.linkedin && pessoa.linkedin.trim() !== '') {
    links.push(`<a class="about-link linkedin" href="${pessoa.linkedin}" target="_blank" rel="noopener" title="LinkedIn de ${pessoa.nome}">in</a>`);
  }
  if (pessoa.lattes && pessoa.lattes.trim() !== '') {
    links.push(`<a class="about-link lattes" href="${pessoa.lattes}" target="_blank" rel="noopener" title="Lattes de ${pessoa.nome}">CV</a>`);
  }
  return links.length ? `<div class="about-links">${links.join('')}</div>` : '';
}

function criarPessoa(pessoa, isProfessor = false) {
  const avatarClass = isProfessor ? 'about-avatar professor' : 'about-avatar';
  return `
    <div class="about-pessoa">
      <div class="about-pessoa-info">
        <div class="${avatarClass}">${iniciais(pessoa.nome)}</div>
        <div class="about-pessoa-nome">${pessoa.nome}</div>
      </div>
      ${criarLinks(pessoa)}
    </div>
  `;
}

function renderizarSobre(data) {
  const professorHTML = data.professor ? `
    <div class="about-secao">
      <div class="about-secao-titulo">${data.professor.titulo || 'Professor'}</div>
      ${criarPessoa(data.professor, true)}
    </div>` : '';

  const alunosHTML = (data.alunos && data.alunos.length) ? `
    <div class="about-secao">
      <div class="about-secao-titulo">Alunos</div>
      ${data.alunos.map(a => criarPessoa(a, false)).join('')}
    </div>` : '';

  if (aboutBody) {
    aboutBody.innerHTML = `
      <div>
        <div class="about-titulo">${data.titulo || 'Sobre o Projeto'}</div>
        <div class="about-descricao">${data.descricao || ''}</div>
      </div>
      ${professorHTML}
      ${alunosHTML}
      ${data.rodape ? `<div class="about-rodape">${data.rodape}</div>` : ''}
    `;
  }
}

// ============ CARREGAR JSONs ============
Promise.all([
  fetch('questoes.json').then(r => { if (!r.ok) throw new Error('Erro ao carregar questoes.json'); return r.json(); }),
  fetch('sobre.json').then(r => { if (!r.ok) throw new Error('Erro ao carregar sobre.json'); return r.json(); }).catch(() => null)
])
  .then(([questoes, sobre]) => {
    quizData = questoes;
    sobreData = sobre;
    if (loadingEl) loadingEl.classList.add('hidden');
    if (quizMain) quizMain.classList.remove('hidden');
    if (sobreData) renderizarSobre(sobreData);
    else if (aboutBody) aboutBody.innerHTML = '<div class="about-descricao">Não foi possível carregar o arquivo <b>sobre.json</b>.</div>';
    loadQuestion();
  })
  .catch(err => {
    if (loadingEl) {
      loadingEl.innerHTML = `❌ Erro ao carregar <b>questoes.json</b>.<br><small>${err.message}</small>`;
    }
    console.error('[ERRO] Falha ao carregar JSONs:', err);
  });

// ============ QUIZ ============
function loadQuestion() {
  console.log('[DEBUG] loadQuestion — currentIndex:', currentIndex);

  answered = false;
  selectedIndex = null;

  if (!quizData || !quizData.questions || !quizData.questions[currentIndex]) {
    console.error('[ERRO] quizData inválido');
    return;
  }

  const q = quizData.questions[currentIndex];

  if (questionText) {
    questionText.textContent = q.question;
    questionText.style.animation = 'none';
    void questionText.offsetWidth;
    questionText.style.animation = '';
  }

  if (optionsContainer) {
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.dataset.index = i;
      const spanText = document.createElement('span');
      spanText.textContent = opt;
      btn.appendChild(spanText);
      btn.addEventListener('click', () => selectOption(i, btn));
      optionsContainer.appendChild(btn);
    });
  }

  // ESCONDE os botões — busca SEMPRE pelo ID
  const btnConfirm = document.getElementById('confirmBtn');
  const btnNext = document.getElementById('nextBtn');

  if (btnConfirm) {
    btnConfirm.style.display = 'none';
    btnConfirm.disabled = true;
  }
  if (btnNext) {
    btnNext.style.display = 'none';
  }

  if (progressInfo) progressInfo.textContent = `Pergunta ${currentIndex + 1} de ${quizData.questions.length}`;
  if (progressFill) progressFill.style.width = `${(currentIndex / quizData.questions.length) * 100}%`;

  iniciarTimer();
}

function selectOption(index, btn) {
  if (answered) return;

  btn.classList.add('rippling');
  setTimeout(() => btn.classList.remove('rippling'), 600);

  document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');
  selectedIndex = index;

  somClique();

  const textoAlternativa = quizData.questions[currentIndex].options[index];
  falar(textoAlternativa);

  // MOSTRA o botão confirmar — busca pelo ID
  const btnConfirm = document.getElementById('confirmBtn');
  if (btnConfirm) {
    btnConfirm.disabled = false;
    btnConfirm.style.display = 'block';
  }
}

// ============ CONFIRMAR ============
function confirmarResposta() {
  // BUSCA os botões a cada clique — nunca guarda referência stale
  const btnConfirm = document.getElementById('confirmBtn');
  const btnNext = document.getElementById('nextBtn');

  console.log('[DEBUG] confirmarResposta. btnConfirm:', btnConfirm ? 'OK' : 'NULL', '| btnNext:', btnNext ? 'OK' : 'NULL');

  if (!btnConfirm || !btnNext) {
    console.error('[ERRO CRÍTICO] Botões não encontrados no DOM!');
    return;
  }

  if (answered || selectedIndex === null || !quizData) return;
  answered = true;
  pararTimer();
  synth.cancel();

  const q = quizData.questions[currentIndex];
  const allOptions = document.querySelectorAll('.option');
  const btnClicado = allOptions[selectedIndex];

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  if (btnClicado) {
    const rect = btnClicado.getBoundingClientRect();
    cx = rect.left + rect.width / 2;
    cy = rect.top + rect.height / 2;
  }

  allOptions.forEach(o => {
    o.classList.add('disabled');
    o.classList.remove('selected');
  });

  const acertou = selectedIndex === q.correct;

  if (acertou) {
    allOptions[q.correct].classList.add('correct');
    allOptions[q.correct].querySelector('span').insertAdjacentHTML('afterend', '<span class="icon">✔</span>');

    combo++;
    score++;
    if (scoreBadge) {
      scoreBadge.textContent = `⭐ ${score} pts`;
      scoreBadge.classList.add('bump');
      setTimeout(() => scoreBadge.classList.remove('bump'), 700);
    }

    somAcerto();
    screenFlash('green');
    celebraContainer();
    explodirParticulas(cx, cy, 35);
    burstConfetti(40);
    mostrarPontosFlutuantes(cx, cy - 30, '+1', '#38ef7d');

    if (combo >= 2) {
      setTimeout(() => {
        mostrarCombo(combo);
        somCombo(combo);
        if (combo >= 3) burstConfetti(30);
      }, 300);
    }
  } else {
    combo = 0;
    allOptions[q.correct].classList.add('correct');
    allOptions[q.correct].querySelector('span').insertAdjacentHTML('afterend', '<span class="icon">✔</span>');
    allOptions[selectedIndex].classList.add('wrong');
    allOptions[selectedIndex].querySelector('span').insertAdjacentHTML('afterend', '<span class="icon">✖</span>');

    somErro();
    screenFlash('red');
    screenShake();
    tremeContainer();
    explodirParticulas(cx, cy, 15, ['#96100E', '#d4181a', '#D66C25']);
  }

  const msg = acertou
    ? 'Resposta correta! Parabéns!'
    : `Resposta incorreta. A resposta correta é: ${q.options[q.correct]}`;
  setTimeout(() => falar(msg), acertou ? 500 : 400);

  if (progressFill) progressFill.style.width = `${((currentIndex + 1) / quizData.questions.length) * 100}%`;

  // Esconde confirmar
  btnConfirm.style.display = 'none';
  btnConfirm.disabled = true;

  // MOSTRA próxima
  btnNext.textContent = currentIndex === quizData.questions.length - 1 ? 'Ver Resultado 🏁' : 'Próxima ➜';
  btnNext.disabled = false;
  btnNext.style.display = 'block';
  btnNext.style.opacity = '1';
  btnNext.style.pointerEvents = 'auto';
  btnNext.style.transform = 'translateY(0)';

  console.log('[DEBUG] Botão próxima exibido com sucesso');
}

if (confirmBtn) confirmBtn.addEventListener('click', confirmarResposta);

// ============ PRÓXIMA ============
function irParaProxima() {
  console.log('[DEBUG] irParaProxima. currentIndex antes:', currentIndex);

  synth.cancel();
  pararTimer();

  currentIndex++;
  console.log('[DEBUG] currentIndex depois:', currentIndex);

  if (currentIndex < quizData.questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

if (nextBtn) nextBtn.addEventListener('click', irParaProxima);

// ============ RESULTADO ============
function showResult() {
  pararTimer();
  if (quizContent) quizContent.classList.add('hidden');
  if (resultScreen) resultScreen.classList.remove('hidden');

  const total = quizData.questions.length;
  const percent = (score / total) * 100;

  const finalScoreEl = document.getElementById('finalScore');
  if (finalScoreEl) finalScoreEl.textContent = `${score} / ${total}`;

  const emoji = document.getElementById('resultEmoji');
  const msg = document.getElementById('resultMessage');

  if (percent === 100) {
    if (emoji) emoji.textContent = '🏆';
    if (msg) msg.textContent = 'PERFEITO! Você é um MESTRE! 🌟';
    burstConfetti(200);
    setTimeout(() => burstConfetti(150), 400);
    setTimeout(() => burstConfetti(100), 800);
    somVitoria();
    screenFlash('green');
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        explodirParticulas(
          window.innerWidth * Math.random(),
          window.innerHeight * Math.random(),
          25
        );
      }, i * 200);
    }
  } else if (percent >= 70) {
    if (emoji) emoji.textContent = '🎉';
    if (msg) msg.textContent = 'Muito bem! Excelente desempenho!';
    burstConfetti(100);
    setTimeout(() => burstConfetti(80), 400);
    somVitoria();
  } else if (percent >= 40) {
    if (emoji) emoji.textContent = '👍';
    if (msg) msg.textContent = 'Bom trabalho! Continue praticando.';
    somAcerto();
  } else {
    if (emoji) emoji.textContent = '📚';
    if (msg) msg.textContent = 'Continue estudando, você vai melhorar!';
    somDerrota();
  }

  if (progressFill) progressFill.style.width = '100%';
  if (progressInfo) progressInfo.textContent = 'Concluído!';
}

if (speakBtn) speakBtn.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) return;
  if (!somAtivado) {
    mostrarToast('🔇 Ative o som para ouvir');
    return;
  }
  synth.cancel();
  if (speakBtn.classList.contains('speaking')) {
    speakBtn.classList.remove('speaking');
    return;
  }
  const q = quizData.questions[currentIndex];
  let texto = `Pergunta ${currentIndex + 1}. ${q.question}. As alternativas são: `;
  q.options.forEach((opt, i) => { texto += `Alternativa ${i + 1}: ${opt}. `; });
  const utter = falar(texto, { onend: () => speakBtn.classList.remove('speaking') });
  if (utter) {
    utter.onstart = () => speakBtn.classList.add('speaking');
    utter.onerror = () => speakBtn.classList.remove('speaking');
  }
});

const restartBtn = document.getElementById('restartBtn');
if (restartBtn) restartBtn.addEventListener('click', () => {
  synth.cancel();
  pararTimer();
  currentIndex = 0;
  score = 0;
  combo = 0;
  answered = false;
  selectedIndex = null;
  if (scoreBadge) scoreBadge.textContent = '⭐ 0 pts';
  if (progressFill) progressFill.style.width = '0%';
  if (resultScreen) resultScreen.classList.add('hidden');
  if (quizContent) quizContent.classList.remove('hidden');
  somClique();
  loadQuestion();
});

// ============ INICIALIZAÇÃO ============
carregarConfig();
carregarSom();
speechSynthesis.onvoiceschanged = listarVozes;
listarVozes();
setTimeout(listarVozes, 200);