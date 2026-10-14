// ============ VOZ (SpeechSynthesis) ============
// Só lista locutores em português (pt-BR, pt-PT, pt-*)

function listarVozes() {
  const todasVozes = speechSynthesis.getVoices();
  if (todasVozes.length === 0) return;

  // Filtra APENAS português
  const vozesPT = todasVozes.filter(v => v.lang.toLowerCase().startsWith('pt'));

  // Se não achou nenhuma voz PT, avisa e mantém vazio
  if (vozesPT.length === 0) {
    console.warn('[voz] Nenhuma voz em português encontrada neste navegador.');
    Estado.vozesDisponiveis = [];

    if (DOM.voiceSelect) {
      DOM.voiceSelect.innerHTML = '';
      const opt = document.createElement('option');
      opt.textContent = 'Nenhuma voz em português disponível';
      opt.disabled = true;
      opt.selected = true;
      DOM.voiceSelect.appendChild(opt);
    }
    return;
  }

  // Ordena: pt-BR primeiro, depois outros pt
  const ptBR = vozesPT.filter(v => v.lang.toLowerCase() === 'pt-br');
  const ptOutros = vozesPT.filter(v => v.lang.toLowerCase() !== 'pt-br');
  Estado.vozesDisponiveis = [...ptBR, ...ptOutros];

  if (!DOM.voiceSelect) return;

  DOM.voiceSelect.innerHTML = '';
  Estado.vozesDisponiveis.forEach((voz, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${voz.name} — ${voz.lang}`;
    DOM.voiceSelect.appendChild(opt);
  });

  const modalAberto = DOM.settingsModal && DOM.settingsModal.classList.contains('show');
  if (modalAberto) {
    selecionarVozNoSelect(configTemp.voiceName, configTemp.voiceLang);
  } else {
    selecionarVozNoSelect(configAtiva.voiceName, configAtiva.voiceLang);
  }
}

function selecionarVozNoSelect(name, lang) {
  if (!DOM.voiceSelect || Estado.vozesDisponiveis.length === 0) return;

  if (!name) {
    // Sem voz salva — pega a primeira pt-BR, ou a primeira da lista
    const idx = Estado.vozesDisponiveis.findIndex(v => v.lang.toLowerCase() === 'pt-br');
    DOM.voiceSelect.selectedIndex = idx >= 0 ? idx : 0;
    return;
  }

  let idx = Estado.vozesDisponiveis.findIndex(v => v.name === name && v.lang === lang);
  if (idx === -1) idx = Estado.vozesDisponiveis.findIndex(v => v.name === name);
  if (idx === -1) idx = Estado.vozesDisponiveis.findIndex(v => v.lang.toLowerCase() === 'pt-br');
  DOM.voiceSelect.selectedIndex = idx >= 0 ? idx : 0;
}

function obterVozAtiva() {
  if (Estado.vozesDisponiveis.length === 0) return null;

  if (!configAtiva.voiceName) {
    return Estado.vozesDisponiveis.find(v => v.lang.toLowerCase() === 'pt-br')
        || Estado.vozesDisponiveis[0];
  }
  return Estado.vozesDisponiveis.find(v => v.name === configAtiva.voiceName && v.lang === configAtiva.voiceLang)
      || Estado.vozesDisponiveis.find(v => v.name === configAtiva.voiceName)
      || Estado.vozesDisponiveis.find(v => v.lang.toLowerCase() === 'pt-br')
      || Estado.vozesDisponiveis[0];
}

function obterVozTemp() {
  if (!DOM.voiceSelect || Estado.vozesDisponiveis.length === 0) return null;
  return Estado.vozesDisponiveis[DOM.voiceSelect.selectedIndex] || null;
}

function falar(texto, opts = {}) {
  if (!('speechSynthesis' in window)) return null;
  if (!Estado.somAtivado) return null;

  const cfg = opts.useTemp ? configTemp : configAtiva;
  const voz = opts.useTemp ? obterVozTemp() : obterVozAtiva();

  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(texto);
  if (voz) utter.voice = voz;
  utter.lang = voz ? voz.lang : 'pt-BR';
  utter.rate = cfg.rate;
  utter.pitch = cfg.pitch;
  utter.volume = cfg.volume;
  if (opts.onend) utter.onend = opts.onend;

  speechSynthesis.speak(utter);
  return utter;
}