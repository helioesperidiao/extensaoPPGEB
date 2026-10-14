// ============ INICIALIZAÇÃO ============
// Último arquivo a rodar. Junta tudo.

function carregarJSONs() {
  return Promise.all([
    fetch('questoes.json').then(r => {
      if (!r.ok) throw new Error('Erro ao carregar questoes.json');
      return r.json();
    }),
    fetch('sobre.json').then(r => {
      if (!r.ok) throw new Error('Erro ao carregar sobre.json');
      return r.json();
    }).catch(() => null)
  ]);
}

function inicializar() {
  console.log('[DEBUG] Inicializando quiz...');

  // 1) Carrega config do localStorage
  carregarConfig();
  carregarSom();

  // 2) Configura eventos dos botões e modais
  configurarEventosModalConfig();
  configurarEventosModalSobre();
  configurarEventosQuiz();

  // 3) Carrega vozes
  speechSynthesis.onvoiceschanged = listarVozes;
  listarVozes();
  setTimeout(listarVozes, 200);

  // 4) Carrega JSONs e inicia o quiz
  carregarJSONs()
    .then(([questoes, sobre]) => {
      Estado.quizData = questoes;
      Estado.sobreData = sobre;

      if (DOM.loading) DOM.loading.classList.add('hidden');
      if (DOM.quizMain) DOM.quizMain.classList.remove('hidden');

      if (sobre) {
        renderizarSobre(sobre);
      } else if (DOM.aboutBody) {
        DOM.aboutBody.innerHTML =
          '<div class="about-descricao">Não foi possível carregar <b>sobre.json</b>.</div>';
      }

      loadQuestion();
    })
    .catch(err => {
      if (DOM.loading) {
        DOM.loading.innerHTML =
          `❌ Erro ao carregar <b>questoes.json</b>.<br><small>${err.message}</small>`;
      }
      console.error('[ERRO] Falha ao carregar JSONs:', err);
    });
}

// Aguarda o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}