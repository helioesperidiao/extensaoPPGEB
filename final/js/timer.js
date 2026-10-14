// ============ TIMER REGRESSIVO ============

function iniciarTimer() {
  pararTimer();

  if (!configAtiva.timerAtivo) {
    if (DOM.timerBar) DOM.timerBar.style.display = 'none';
    if (DOM.timerLabel) DOM.timerLabel.style.display = 'none';
    return;
  }
  if (DOM.timerBar) DOM.timerBar.style.display = 'block';
  if (DOM.timerLabel) DOM.timerLabel.style.display = 'block';

  Estado.timeLeft = configAtiva.tempoPergunta;
  atualizarTimerUI();

  Estado.timerInterval = setInterval(() => {
    Estado.timeLeft -= 0.1;
    if (Estado.timeLeft <= 0) {
      Estado.timeLeft = 0;
      atualizarTimerUI();
      pararTimer();
      tempoEsgotado();
    } else {
      atualizarTimerUI();
      if (Estado.timeLeft <= 5 && Math.abs((Estado.timeLeft * 10) % 10) < 0.5) {
        somTique();
      }
    }
  }, 100);
}

function pararTimer() {
  if (Estado.timerInterval) {
    clearInterval(Estado.timerInterval);
    Estado.timerInterval = null;
  }
}

function atualizarTimerUI() {
  if (!configAtiva.timerAtivo) return;
  if (!DOM.timerFill || !DOM.timerLabel) return;

  const pct = (Estado.timeLeft / configAtiva.tempoPergunta) * 100;
  DOM.timerFill.style.width = pct + '%';
  DOM.timerLabel.textContent = `⏱️ ${Math.ceil(Estado.timeLeft)}s`;

  DOM.timerFill.classList.remove('warning', 'danger');
  DOM.timerLabel.classList.remove('warning', 'danger');

  if (pct <= 20) {
    DOM.timerFill.classList.add('danger');
    DOM.timerLabel.classList.add('danger');
  } else if (pct <= 50) {
    DOM.timerFill.classList.add('warning');
    DOM.timerLabel.classList.add('warning');
  }
}

function tempoEsgotado() {
  if (Estado.answered) return;
  Estado.answered = true;
  Estado.combo = 0;

  speechSynthesis.cancel();
  somTempoEsgotado();
  flashTimeUp();
  screenFlash('red');
  screenShake();
  tremeContainer();

  const q = Estado.quizData.questions[Estado.currentIndex];
  const allOptions = document.querySelectorAll('.option');

  allOptions.forEach(o => {
    o.classList.add('disabled');
    o.classList.remove('selected');
  });

  allOptions[q.correct].classList.add('correct');
  allOptions[q.correct].querySelector('span')
    .insertAdjacentHTML('afterend', '<span class="icon">✔</span>');

  setTimeout(() => {
    falar(`Tempo esgotado! A resposta correta é: ${q.options[q.correct]}`);
  }, 400);

  if (DOM.progressFill) {
    DOM.progressFill.style.width =
      `${((Estado.currentIndex + 1) / Estado.quizData.questions.length) * 100}%`;
  }

  // Esconde confirmar
  if (DOM.confirmBtn) {
    DOM.confirmBtn.style.display = 'none';
    DOM.confirmBtn.disabled = true;
  }

  // Mostra próxima
  if (DOM.nextBtn) {
    DOM.nextBtn.textContent = Estado.currentIndex === Estado.quizData.questions.length - 1
      ? 'Ver Resultado 🏁'
      : 'Próxima ➜';
    DOM.nextBtn.disabled = false;
    DOM.nextBtn.style.display = 'block';
    DOM.nextBtn.style.opacity = '1';
    DOM.nextBtn.style.pointerEvents = 'auto';
    DOM.nextBtn.style.transform = 'translateY(0)';
  }
}