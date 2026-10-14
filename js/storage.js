// ============ LOCALSTORAGE ============

function carregarConfig() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) configAtiva = { ...configAtiva, ...JSON.parse(salvo) };
  } catch (e) { console.warn('[storage] Erro ao ler config:', e); }
}

function salvarConfig() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configAtiva));
  } catch (e) { console.warn('[storage] Erro ao salvar config:', e); }
}

function carregarSom() {
  try {
    const salvo = localStorage.getItem(STORAGE_SOM);
    if (salvo !== null) Estado.somAtivado = salvo === 'true';
  } catch (e) { console.warn('[storage] Erro ao ler som:', e); }
  atualizarBotaoSom();
}

function salvarSom() {
  try {
    localStorage.setItem(STORAGE_SOM, Estado.somAtivado ? 'true' : 'false');
  } catch (e) { console.warn('[storage] Erro ao salvar som:', e); }
}

function atualizarBotaoSom() {
  if (!DOM.soundBtn) return;
  if (Estado.somAtivado) {
    DOM.soundBtn.textContent = '🔊';
    DOM.soundBtn.classList.remove('muted');
    DOM.soundBtn.title = 'Som ligado — clique para desligar';
  } else {
    DOM.soundBtn.textContent = '🔇';
    DOM.soundBtn.classList.add('muted');
    DOM.soundBtn.title = 'Som desligado — clique para ligar';
  }
}

function mostrarToast(msg) {
  if (!DOM.toast) return;
  DOM.toast.textContent = msg;
  DOM.toast.classList.add('show');
  setTimeout(() => DOM.toast.classList.remove('show'), 2200);
}