// ============ MODAL DE CONFIGURAÇÕES ============

function abrirModal() {
  configTemp = { ...configAtiva };

  selecionarVozNoSelect(configTemp.voiceName, configTemp.voiceLang);

  if (DOM.rateRange) DOM.rateRange.value = configTemp.rate;
  if (DOM.pitchRange) DOM.pitchRange.value = configTemp.pitch;
  if (DOM.volumeRange) DOM.volumeRange.value = configTemp.volume;
  if (DOM.timerAtivoCheck) DOM.timerAtivoCheck.checked = configTemp.timerAtivo;
  if (DOM.tempoRange) DOM.tempoRange.value = configTemp.tempoPergunta;
  if (DOM.tempoFieldGroup) DOM.tempoFieldGroup.classList.toggle('disabled', !configTemp.timerAtivo);

  atualizarLabels();
  if (DOM.settingsModal) DOM.settingsModal.classList.add('show');
  somClique();
}

function fecharModal() {
  if (DOM.settingsModal) DOM.settingsModal.classList.remove('show');
  speechSynthesis.cancel();
}

function atualizarLabels() {
  if (DOM.rateValue && DOM.rateRange)
    DOM.rateValue.textContent = parseFloat(DOM.rateRange.value).toFixed(2) + 'x';
  if (DOM.pitchValue && DOM.pitchRange)
    DOM.pitchValue.textContent = parseFloat(DOM.pitchRange.value).toFixed(2);
  if (DOM.volumeValue && DOM.volumeRange)
    DOM.volumeValue.textContent = Math.round(DOM.volumeRange.value * 100) + '%';
  if (DOM.tempoValue && DOM.tempoRange)
    DOM.tempoValue.textContent = DOM.tempoRange.value + 's';
}

function configurarEventosModalConfig() {
  if (DOM.settingsBtn) DOM.settingsBtn.addEventListener('click', abrirModal);
  if (DOM.modalCloseBtn) DOM.modalCloseBtn.addEventListener('click', fecharModal);
  if (DOM.cancelBtn) DOM.cancelBtn.addEventListener('click', fecharModal);

  if (DOM.settingsModal) {
    DOM.settingsModal.addEventListener('click', e => {
      if (e.target === DOM.settingsModal) fecharModal();
    });
  }

  if (DOM.voiceSelect) {
    DOM.voiceSelect.addEventListener('change', () => {
      const voz = obterVozTemp();
      if (voz) {
        configTemp.voiceName = voz.name;
        configTemp.voiceLang = voz.lang;
      }
      somClique();
    });
  }

  if (DOM.rateRange) {
    DOM.rateRange.addEventListener('input', () => {
      configTemp.rate = parseFloat(DOM.rateRange.value);
      atualizarLabels();
    });
  }

  if (DOM.pitchRange) {
    DOM.pitchRange.addEventListener('input', () => {
      configTemp.pitch = parseFloat(DOM.pitchRange.value);
      atualizarLabels();
    });
  }

  if (DOM.volumeRange) {
    DOM.volumeRange.addEventListener('input', () => {
      configTemp.volume = parseFloat(DOM.volumeRange.value);
      atualizarLabels();
    });
  }

  if (DOM.timerAtivoCheck) {
    DOM.timerAtivoCheck.addEventListener('change', () => {
      configTemp.timerAtivo = DOM.timerAtivoCheck.checked;
      if (DOM.tempoFieldGroup) {
        DOM.tempoFieldGroup.classList.toggle('disabled', !configTemp.timerAtivo);
      }
      somClique();
    });
  }

  if (DOM.tempoRange) {
    DOM.tempoRange.addEventListener('input', () => {
      configTemp.tempoPergunta = parseInt(DOM.tempoRange.value, 10);
      atualizarLabels();
    });
  }

  if (DOM.testVoiceBtn) {
    DOM.testVoiceBtn.addEventListener('click', () => {
      const voz = obterVozTemp();
      if (voz) {
        configTemp.voiceName = voz.name;
        configTemp.voiceLang = voz.lang;
      }
      falar('Esta é uma demonstração da voz escolhida. Um, dois, três, testando.',
            { useTemp: true });
    });
  }

  if (DOM.resetConfigBtn) {
    DOM.resetConfigBtn.addEventListener('click', () => {
      configTemp = {
        voiceName: null, voiceLang: null,
        rate: 1, pitch: 1, volume: 1,
        timerAtivo: true, tempoPergunta: 30
      };
      selecionarVozNoSelect(null, null);
      if (DOM.rateRange) DOM.rateRange.value = 1;
      if (DOM.pitchRange) DOM.pitchRange.value = 1;
      if (DOM.volumeRange) DOM.volumeRange.value = 1;
      if (DOM.timerAtivoCheck) DOM.timerAtivoCheck.checked = true;
      if (DOM.tempoRange) DOM.tempoRange.value = 30;
      if (DOM.tempoFieldGroup) DOM.tempoFieldGroup.classList.remove('disabled');
      atualizarLabels();
      somClique();
    });
  }

  if (DOM.saveBtn) {
    DOM.saveBtn.addEventListener('click', () => {
      const voz = obterVozTemp();
      if (voz) {
        configTemp.voiceName = voz.name;
        configTemp.voiceLang = voz.lang;
      }
      configAtiva = { ...configTemp };
      salvarConfig();
      fecharModal();
      mostrarToast('✓ Configurações salvas!');
      somAcerto();

      if (!Estado.answered && Estado.quizData) iniciarTimer();
    });
  }
}