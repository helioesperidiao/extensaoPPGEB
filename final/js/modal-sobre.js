// ============ MODAL SOBRE ============

function abrirAbout() {
  if (DOM.aboutModal) DOM.aboutModal.classList.add('show');
  somClique();
}

function fecharAbout() {
  if (DOM.aboutModal) DOM.aboutModal.classList.remove('show');
}

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

  if (DOM.aboutBody) {
    DOM.aboutBody.innerHTML = `
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

function configurarEventosModalSobre() {
  if (DOM.aboutBtn) DOM.aboutBtn.addEventListener('click', abrirAbout);
  if (DOM.aboutCloseBtn) DOM.aboutCloseBtn.addEventListener('click', fecharAbout);
  if (DOM.aboutOkBtn) DOM.aboutOkBtn.addEventListener('click', fecharAbout);
  if (DOM.aboutModal) {
    DOM.aboutModal.addEventListener('click', e => {
      if (e.target === DOM.aboutModal) fecharAbout();
    });
  }
}

// Atalho ESC global fecha qualquer modal aberto
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (DOM.settingsModal && DOM.settingsModal.classList.contains('show')) fecharModal();
    if (DOM.aboutModal && DOM.aboutModal.classList.contains('show')) fecharAbout();
  }
});