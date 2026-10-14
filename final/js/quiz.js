// ============ LÓGICA DO QUIZ ============

function loadQuestion() {
  console.log('[DEBUG] loadQuestion — currentIndex:', Estado.currentIndex);

  Estado.answered = false;
  Estado.selectedIndex = null;

  if (!Estado.quizData || !Estado.quizData.questions[Estado.currentIndex]) {
    console.error('[ERRO] quizData inválido');
    return;
  }

  const q = Estado.quizData.questions[Estado.currentIndex];

  if (DOM.questionText) {
    DOM.questionText.textContent = q.question;
    DOM.questionText.style.animation = 'none';
    void DOM.questionText.offsetWidth;
    DOM.questionText.style.animation = '';
  }

  if (DOM.options) {
    DOM.options.innerHTML = '';

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.dataset.index = i;
      const spanText = document.createElement('span');
      spanText.textContent = opt;
      btn.appendChild(spanText);
      btn.addEventListener('click', () => selectOption(i, btn));
      DOM.options.appendChild(btn);
    });
  }

  // Reseta botões
  if (DOM.confirmBtn) {
    DOM.confirmBtn.style.display = 'none';
    DOM.confirmBtn.disabled = true;
  }
  if (DOM.nextBtn) {
    DOM.nextBtn.style.display = 'none';
  }

  if (DOM.progressInfo) {
    DOM.progressInfo.textContent =
      `Pergunta ${Estado.currentIndex + 1} de ${Estado.quizData.questions.length}`;
  }
  if (DOM.progressFill) {
    DOM.progressFill.style.width =
      `${(Estado.currentIndex / Estado.quizData.questions.length) * 100}%`;
  }

  iniciarTimer();
}

function selectOption(index, btn) {
  if (Estado.answered) return;

  btn.classList.add('rippling');
  setTimeout(() => btn.classList.remove('rippling'), 600);

  document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');
  Estado.selectedIndex = index;

  somClique();

  const textoAlternativa = Estado.quizData.questions[Estado.currentIndex].options[index];
  falar(textoAlternativa);

  if (DOM.confirmBtn) {
    DOM.confirmBtn.disabled = false;
    DOM.confirmBtn.style.display = 'block';
  }
}

function confirmarResposta() {
  const btnConfirm = document.getElementById('confirmBtn');
  const btnNext = document.getElementById('nextBtn');

  if (!btnConfirm || !btnNext) {
    console.error('[ERRO CRÍTICO] Botões não encontrados no DOM!');
    return;
  }

  if (Estado.answered || Estado.selectedIndex === null || !Estado.quizData) return;

  Estado.answered = true;
  pararTimer();
  speechSynthesis.cancel();

  const q = Estado.quizData.questions[Estado.currentIndex];
  const allOptions = document.querySelectorAll('.option');
  const btnClicado = allOptions[Estado.selectedIndex];

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

  const acertou = Estado.selectedIndex === q.correct;

  if (acertou) {
    allOptions[q.correct].classList.add('correct');
    allOptions[q.correct].querySelector('span')
      .insertAdjacentHTML('afterend', '<span class="icon">✔</span>');

    Estado.combo++;
    Estado.score++;

    if (DOM.scoreBadge) {
      DOM.scoreBadge.textContent = `⭐ ${Estado.score} pts`;
      DOM.scoreBadge.classList.add('bump');
      setTimeout(() => DOM.scoreBadge.classList.remove('bump'), 700);
    }

    somAcerto();
    screenFlash('green');
    celebraContainer();
    explodirParticulas(cx, cy, 35);
    burstConfetti(40);
    mostrarPontosFlutuantes(cx, cy - 30, '+1', '#38ef7d');

    if (Estado.combo >= 2) {
      setTimeout(() => {
        mostrarCombo(Estado.combo);
        somCombo(Estado.combo);
        if (Estado.combo >= 3) burstConfetti(30);
      }, 300);
    }
  } else {
    Estado.combo = 0;

    allOptions[q.correct].classList.add('correct');
    allOptions[q.correct].querySelector('span')
      .insertAdjacentHTML('afterend', '<span class="icon">✔</span>');

    allOptions[Estado.selectedIndex].classList.add('wrong');
    allOptions[Estado.selectedIndex].querySelector('span')
      .insertAdjacentHTML('afterend', '<span class="icon">✖</span>');

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

  if (DOM.progressFill) {
    DOM.progressFill.style.width =
      `${((Estado.currentIndex + 1) / Estado.quizData.questions.length) * 100}%`;
  }

  // Esconde confirmar
  btnConfirm.style.display = 'none';
  btnConfirm.disabled = true;

  // Mostra próxima
  btnNext.textContent = Estado.currentIndex === Estado.quizData.questions.length - 1
    ? 'Ver Resultado 🏁'
    : 'Próxima ➜';
  btnNext.disabled = false;
  btnNext.style.display = 'block';
  btnNext.style.opacity = '1';
  btnNext.style.pointerEvents = 'auto';
  btnNext.style.transform = 'translateY(0)';
}

function irParaProxima() {
  console.log('[DEBUG] irParaProxima. currentIndex antes:', Estado.currentIndex);

  speechSynthesis.cancel();
  pararTimer();

  Estado.currentIndex++;
  console.log('[DEBUG] currentIndex depois:', Estado.currentIndex);

  if (Estado.currentIndex < Estado.quizData.questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  pararTimer();
  if (DOM.quizContent) DOM.quizContent.classList.add('hidden');
  if (DOM.resultScreen) DOM.resultScreen.classList.remove('hidden');

  const total = Estado.quizData.questions.length;
  const percent = (Estado.score / total) * 100;

  if (DOM.finalScore) DOM.finalScore.textContent = `${Estado.score} / ${total}`;

  const emoji = DOM.resultEmoji;
  const msg = DOM.resultMessage;

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

  if (DOM.progressFill) DOM.progressFill.style.width = '100%';
  if (DOM.progressInfo) DOM.progressInfo.textContent = 'Concluído!';
}

function reiniciarQuiz() {
  speechSynthesis.cancel();
  pararTimer();

  Estado.currentIndex = 0;
  Estado.score = 0;
  Estado.combo = 0;
  Estado.answered = false;
  Estado.selectedIndex = null;

  if (DOM.scoreBadge) DOM.scoreBadge.textContent = '⭐ 0 pts';
  if (DOM.progressFill) DOM.progressFill.style.width = '0%';
  if (DOM.resultScreen) DOM.resultScreen.classList.add('hidden');
  if (DOM.quizContent) DOM.quizContent.classList.remove('hidden');

  somClique();
  loadQuestion();
}

// ============ EVENTOS ============
function configurarEventosQuiz() {
  if (DOM.confirmBtn) DOM.confirmBtn.addEventListener('click', confirmarResposta);
  if (DOM.nextBtn) DOM.nextBtn.addEventListener('click', irParaProxima);
  if (DOM.restartBtn) DOM.restartBtn.addEventListener('click', reiniciarQuiz);

  // Botão de som
  if (DOM.soundBtn) {
    DOM.soundBtn.addEventListener('click', () => {
      Estado.somAtivado = !Estado.somAtivado;
      salvarSom();
      atualizarBotaoSom();

      if (Estado.somAtivado) {
        somClique();
        mostrarToast('🔊 Som ligado');
      } else {
        speechSynthesis.cancel();
        mostrarToast('🔇 Som desligado');
      }
    });
  }

  // Botão "ouvir pergunta"
  if (DOM.speakBtn) {
    DOM.speakBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) return;
      if (!Estado.somAtivado) {
        mostrarToast('🔇 Ative o som para ouvir');
        return;
      }
      speechSynthesis.cancel();

      if (DOM.speakBtn.classList.contains('speaking')) {
        DOM.speakBtn.classList.remove('speaking');
        return;
      }

      const q = Estado.quizData.questions[Estado.currentIndex];
      let texto = `Pergunta ${Estado.currentIndex + 1}. ${q.question}. As alternativas são: `;
      q.options.forEach((opt, i) => { texto += `Alternativa ${i + 1}: ${opt}. `; });

      const utter = falar(texto, { onend: () => DOM.speakBtn.classList.remove('speaking') });
      if (utter) {
        utter.onstart = () => DOM.speakBtn.classList.add('speaking');
        utter.onerror = () => DOM.speakBtn.classList.remove('speaking');
      }
    });
  }
}