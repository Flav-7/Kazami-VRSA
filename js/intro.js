/*
 * Intro / loader
 * A barra enche consoante o carregamento real (DOM, imagens, vídeo, fontes, window.load).
 * Há um tempo mínimo para a intro ser vista e a barra anima sempre suavemente até 100%.
 */
(function () {
  const MIN_DURATION = 3800; // ms mínimos de intro
  const MAX_DURATION = 12000; // nunca prende o utilizador mais do que isto
  const EXIT_DELAY = 500;    // pausa com a barra cheia antes de sair

  const intro = document.getElementById('intro');
  const bar = intro.querySelector('.intro__bar');
  const fill = intro.querySelector('.intro__bar-fill');
  const video = intro.querySelector('.intro__video');
  const start = performance.now();

  // ?skip no URL salta a intro (útil em desenvolvimento)
  if (new URLSearchParams(location.search).has('skip')) {
    intro.remove();
    document.body.classList.remove('is-loading');
    return;
  }

  // ---- tarefas de carregamento ----
  const tasks = [];
  const track = (promise) => {
    const t = { done: false };
    tasks.push(t);
    Promise.resolve(promise).catch(() => {}).finally(() => { t.done = true; });
  };

  // vídeo da intro
  track(new Promise((res) => {
    if (video.readyState >= 4) return res();
    video.addEventListener('canplaythrough', res, { once: true });
    video.addEventListener('error', res, { once: true });
  }));

  // fontes
  if (document.fonts && document.fonts.ready) track(document.fonts.ready);

  // todas as imagens do site
  document.querySelectorAll('img').forEach((img) => {
    track(img.complete ? null : new Promise((res) => {
      img.addEventListener('load', res, { once: true });
      img.addEventListener('error', res, { once: true });
    }));
  });

  // página inteira
  track(new Promise((res) => {
    if (document.readyState === 'complete') return res();
    window.addEventListener('load', res, { once: true });
  }));

  // velocidade do corte (1 = original, ciclo ~1,6s)
  const SPEED = 1.2;
  video.playbackRate = SPEED;
  video.addEventListener('loadedmetadata', () => { video.playbackRate = SPEED; });
  video.addEventListener('play', () => { video.playbackRate = SPEED; });

  // garante que o vídeo arranca (alguns browsers bloqueiam autoplay)
  const p = video.play();
  if (p && p.catch) p.catch(() => {});

  // ---- animação da barra ----
  let shown = 0;
  let finished = false;
  let last = start;

  function frame(now) {
    const elapsed = now - start;
    const dt = Math.min(now - last, 100);
    last = now;
    const loaded = tasks.filter((t) => t.done).length / tasks.length;
    const timeCap = Math.min(elapsed / MIN_DURATION, 1); // não passa à frente do tempo mínimo
    const forced = elapsed >= MAX_DURATION;

    // alvo: o menor entre o progresso real e o tempo, nunca 100% antes de tudo carregar
    let target = forced ? 1 : Math.min(loaded, timeCap);
    if (target < 1) target = Math.min(target, 0.97);

    // easing suave em direção ao alvo (independente da taxa de frames)
    shown += (target - shown) * (1 - Math.exp(-dt / 260));
    if (target === 1 && 1 - shown < 0.002) shown = 1;

    fill.style.setProperty('--p', shown.toFixed(4));
    bar.setAttribute('aria-valuenow', Math.round(shown * 100));

    if (shown === 1 && !finished) {
      finished = true;
      setTimeout(exit, EXIT_DELAY);
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function exit() {
    intro.classList.add('is-done');
    document.body.classList.remove('is-loading');
    // remove a intro do DOM depois do fade (1.2s no CSS)
    setTimeout(() => {
      video.pause();
      intro.remove();
    }, 1400);
  }
})();
