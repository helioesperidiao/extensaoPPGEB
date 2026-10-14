// ============ ESTADO GLOBAL ============
// Este arquivo roda primeiro. Todos os outros usam essas variáveis.

const Estado = {
  quizData: null,
  sobreData: null,
  currentIndex: 0,
  score: 0,
  answered: false,
  selectedIndexes: [],   // ← era selectedIndex: null (agora é array, suporta múltiplas)
  combo: 0,
  somAtivado: true,
  vozesDisponiveis: [],
  synth: window.speechSynthesis,
  audioCtx: null,
  timerInterval: null,
  timeLeft: 0
};

// Configuração ativa (voz + jogo)
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

// ============ CONSTANTES ============
const STORAGE_KEY = 'quizVoiceConfig';
const STORAGE_SOM = 'quizSomAtivado';

// ============ ATALHOS PARA ELEMENTOS DO DOM ============
const $ = (id) => document.getElementById(id);

const DOM = {
  // Quiz
  loading: $('loading'),
  quizMain: $('quizMain'),
  questionText: $('questionText'),
  options: $('options'),
  nextBtn: $('nextBtn'),
  confirmBtn: $('confirmBtn'),
  progressInfo: $('progressInfo'),
  progressFill: $('progressFill'),
  scoreBadge: $('scoreBadge'),
  speakBtn: $('speakBtn'),
  quizContent: $('quizContent'),
  resultScreen: $('resultScreen'),
  quizContainer: $('quizContainer'),
  multiHint: $('multiHint'),

  // Timer
  timerBar: $('timerBar'),
  timerFill: $('timerFill'),
  timerLabel: $('timerLabel'),

  // Botões topo
  soundBtn: $('soundBtn'),
  aboutBtn: $('aboutBtn'),
  settingsBtn: $('settingsBtn'),

  // Modal configurações
  settingsModal: $('settingsModal'),
  modalCloseBtn: $('modalCloseBtn'),
  cancelBtn: $('cancelBtn'),
  saveBtn: $('saveBtn'),
  resetConfigBtn: $('resetConfigBtn'),
  voiceSelect: $('voiceSelect'),
  rateRange: $('rateRange'),
  pitchRange: $('pitchRange'),
  volumeRange: $('volumeRange'),
  rateValue: $('rateValue'),
  pitchValue: $('pitchValue'),
  volumeValue: $('volumeValue'),
  testVoiceBtn: $('testVoiceBtn'),
  timerAtivoCheck: $('timerAtivoCheck'),
  tempoRange: $('tempoRange'),
  tempoValue: $('tempoValue'),
  tempoFieldGroup: $('tempoFieldGroup'),

  // Modal sobre
  aboutModal: $('aboutModal'),
  aboutCloseBtn: $('aboutCloseBtn'),
  aboutOkBtn: $('aboutOkBtn'),
  aboutBody: $('aboutBody'),

  // Resultado
  resultEmoji: $('resultEmoji'),
  finalScore: $('finalScore'),
  resultMessage: $('resultMessage'),
  restartBtn: $('restartBtn'),

  // Toast
  toast: $('toast')
};

// ============ HELPERS DE RESPOSTA MÚLTIPLA ============

// Normaliza "correct" para array — aceita número OU array
function getCorrectIndexes(q) {
  return Array.isArray(q.correct) ? q.correct.slice() : [q.correct];
}

// Retorna true se a pergunta exige mais de uma marcação
function isMultiResposta(q) {
  return getCorrectIndexes(q).length > 1;
}

// Compara dois conjuntos (usa cópia para não mutar)
function conjuntosIguais(a, b) {
  if (a.length !== b.length) return false;
  const sa = a.slice().sort();
  const sb = b.slice().sort();
  return sa.every((v, i) => v === sb[i]);
}