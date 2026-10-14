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
  if (!DOM.quizContainer) return;
  DOM.quizContainer.classList.add('celebrating');
  setTimeout(() => DOM.quizContainer.classList.remove('celebrating'), 700);
}

function tremeContainer() {
  if (!DOM.quizContainer) return;
  DOM.quizContainer.classList.add('failing');
  setTimeout(() => DOM.quizContainer.classList.remove('failing'), 500);
}

function flashTimeUp() {
  if (!DOM.quizContainer) return;
  DOM.quizContainer.classList.add('time-up');
  setTimeout(() => DOM.quizContainer.classList.remove('time-up'), 1400);
}

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