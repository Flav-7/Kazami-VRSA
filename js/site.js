/* KAZAMI — interações da página principal */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  // ---------- escala: 1u = largura útil / 1024 (sem contar a scrollbar) ----------
  const MOBILE = window.matchMedia('(max-width: 899px)');
  function setScale() {
    if (MOBILE.matches) { root.style.removeProperty('--u'); return; }
    const u = Math.min(root.clientWidth / 1024, 2);
    root.style.setProperty('--u', u + 'px');
  }
  setScale();
  window.addEventListener('resize', setScale);
  if ('ResizeObserver' in window) new ResizeObserver(setScale).observe(root);

  // ---------- menu (dados) ----------
  // Imagens: recortes provisórios do design — substituir por fotos reais de cada prato.
  const IMG = {
    edamame: 'assets/img/prato-1.webp',
    gyoza: 'assets/img/prato-2.webp',
    tartaro: 'assets/img/prato-3.webp',
    tempura: 'assets/img/prato-4.webp',
    nigiri: 'assets/img/galeria-2.webp',
    atum: 'assets/img/band-faca.webp',
  };
  const MENU = {
    'Entradas': [
      ['Edamame', 4.0, IMG.edamame],
      ['Gyoza de Legumes', 5.5, IMG.gyoza],
      ['Tártaro de Salmão', 8.5, IMG.tartaro],
      ['Tempurá de Camarão', 9.0, IMG.tempura],
    ],
    'Sashimi': [
      ['Sashimi de Salmão (6)', 9.5, IMG.atum],
      ['Sashimi de Atum (6)', 11.0, IMG.atum],
      ['Sashimi Misto (12)', 18.0, IMG.atum],
      ['Usuzukuri de Robalo', 12.5, IMG.tartaro],
    ],
    'Nigiri': [
      ['Nigiri de Salmão (2)', 4.5, IMG.nigiri],
      ['Nigiri de Atum (2)', 5.5, IMG.nigiri],
      ['Nigiri Flambeado (2)', 5.0, IMG.nigiri],
      ['Nigiri de Peixe Branco (2)', 4.5, IMG.nigiri],
    ],
    'Uramaki': [
      ['Uramaki Califórnia (8)', 8.5, IMG.tartaro],
      ['Uramaki Salmão Avocado (8)', 9.0, IMG.tartaro],
      ['Uramaki Ebi Ten (8)', 10.0, IMG.tempura],
      ['Uramaki Spicy Tuna (8)', 10.5, IMG.atum],
    ],
    'Hot Rolls': [
      ['Hot Roll Salmão (8)', 8.5, IMG.tempura],
      ['Hot Roll Philadelphia (8)', 9.0, IMG.tempura],
      ['Hot Roll Camarão (8)', 9.5, IMG.tempura],
      ['Hot Roll Kazami (8)', 10.5, IMG.tempura],
    ],
    'Temakis': [
      ['Temaki de Salmão', 7.0, IMG.tartaro],
      ['Temaki de Atum', 7.5, IMG.atum],
      ['Temaki Ebi Ten', 7.5, IMG.tempura],
      ['Temaki Vegetariano', 6.0, IMG.edamame],
    ],
    'Gunkan': [
      ['Gunkan de Salmão (2)', 5.0, IMG.nigiri],
      ['Gunkan Ikura (2)', 6.5, IMG.nigiri],
      ['Gunkan Spicy Tuna (2)', 6.0, IMG.atum],
      ['Gunkan de Tártaro (2)', 5.5, IMG.tartaro],
    ],
    'Sobremesas': [
      ['Mochi (3)', 5.5, IMG.gyoza],
      ['Dorayaki', 4.5, IMG.gyoza],
      ['Gelado de Chá Verde', 4.0, IMG.edamame],
      ['Cheesecake de Yuzu', 5.5, IMG.tartaro],
    ],
  };

  const eur = (n) => '€' + n.toFixed(2).replace('.', ',');
  const tabs = $('.tabs');
  const cards = $('.cards');

  Object.keys(MENU).forEach((cat, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.role = 'tab';
    b.textContent = cat;
    if (i === 0) b.classList.add('is-on');
    b.addEventListener('click', () => {
      $$('button', tabs).forEach((x) => x.classList.toggle('is-on', x === b));
      renderCards(cat);
    });
    tabs.appendChild(b);
  });

  function renderCards(cat) {
    cards.innerHTML = MENU[cat].map(([name, price, img], i) => `
      <article class="card" style="animation-delay:${i * 60}ms">
        <img src="${img}" alt="${name}" loading="lazy">
        <h3 class="card__name">${name}</h3>
        <p class="card__price">${eur(price)}</p>
        <button class="card__add" type="button" aria-label="Adicionar ${name}" data-name="${name}">+</button>
      </article>`).join('');
  }
  renderCards('Entradas');

  // ---------- toast ----------
  const toast = $('.toast');
  let toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2200);
  }
  cards.addEventListener('click', (e) => {
    const b = e.target.closest('.card__add');
    if (b) showToast(`${b.dataset.name} adicionado ao pedido`);
  });

  // ---------- galeria ----------
  const track = $('.gal__track');
  const view = $('.gal__view');
  let gi = 0;
  const maxShift = () => Math.max(track.scrollWidth - view.clientWidth, 0);
  const shiftOf = (i) => Math.min($$('a', track)[i].offsetLeft, maxShift());
  // último índice que ainda faz a galeria andar
  const lastIdx = () => $$('a', track).findIndex((a) => a.offsetLeft >= maxShift() - 1);
  function galGo(n) {
    const last = lastIdx() < 0 ? 0 : lastIdx();
    gi = n > last ? 0 : n < 0 ? last : n; // dá a volta nas pontas
    track.style.transform = `translateX(${-shiftOf(gi)}px)`;
  }
  $('.gal__next').addEventListener('click', () => galGo(gi + 1));
  $('.gal__prev').addEventListener('click', () => galGo(gi - 1));
  window.addEventListener('resize', () => galGo(gi));

  // lightbox
  const lb = $('.lightbox');
  track.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    $('img', lb).src = a.href;
    $('img', lb).alt = $('img', a).alt;
    lb.hidden = false;
  });
  lb.addEventListener('click', (e) => { if (e.target !== $('img', lb)) lb.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.hidden = true; });

  // ---------- header: menu mobile + link ativo ----------
  const hdr = $('.hdr');
  const burger = $('.burger');
  burger.addEventListener('click', () => {
    const open = hdr.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav a').forEach((a) => a.addEventListener('click', () => {
    hdr.classList.remove('is-open');
    burger.setAttribute('aria-expanded', false);
  }));

  const links = $$('.nav a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['inicio', 'menu', 'historia', 'galeria', 'contactos'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  // header fica sólido depois de passar o hero
  const hero = $('.hero');
  function hdrSolid() {
    hdr.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - hdr.offsetHeight);
  }
  hdrSolid();
  window.addEventListener('scroll', hdrSolid, { passive: true });

  // compensa o header fixo nas âncoras
  function hdrH() { return hdr.getBoundingClientRect().height; }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = id === 'topo' ? document.body : document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const y = id === 'topo' || id === 'inicio' ? 0 : el.getBoundingClientRect().top + window.scrollY - hdrH();
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
})();
