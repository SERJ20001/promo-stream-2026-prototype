(() => {
  const app = document.querySelector('#app');
  const layer = document.createElement('div');
  layer.className = 'heartBalloonLayer';
  layer.hidden = true;
  layer.innerHTML = '<img class="heartBalloonHeart" src="assets/heart-balloon.png" alt=""><img class="heartBalloonHeart" src="assets/heart-balloon.png" alt=""><img class="heartBalloonHeart" src="assets/heart-balloon.png" alt=""><div class="heartBalloonToast" role="status" aria-live="polite">Добавления в избранное у вашего<br>товара взлетают вверх! ❤️ 🎈</div>';
  app.append(layer);

  const toast = layer.querySelector('.heartBalloonToast');
  const hearts = [...layer.querySelectorAll('.heartBalloonHeart')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const heartSpecs = [
    { startX: -72, endX: -42, bottomOffset: -76, endY: -214, delay: 0, duration: 3000, amplitude: .21, phase: .2, cycles: 1.1, swayAmplitude: 12, swayCycles: .95, swayPhase: .4 },
    { startX: 292, endX: 258, bottomOffset: -30, endY: -232, delay: 150, duration: 3180, amplitude: .27, phase: 2.4, cycles: 1.25, swayAmplitude: 15, swayCycles: 1.1, swayPhase: 2.1 },
    { startX: 112, endX: 148, bottomOffset: 4, endY: -205, delay: 310, duration: 2860, amplitude: .18, phase: 4.1, cycles: 1.05, swayAmplitude: 10, swayCycles: 1.25, swayPhase: 4 }
  ];
  let runId = 0;
  let animationFrame = 0;
  let toastAnimation;
  let toastHideTimer;

  function smootherStep(value) {
    return value * value * value * (value * (value * 6 - 15) + 10);
  }

  function integratedSpeed(progress, spec) {
    const omega = Math.PI * 2 * spec.cycles;
    const integral = progress + spec.amplitude / omega * (Math.cos(spec.phase) - Math.cos(omega * progress + spec.phase));
    const total = 1 + spec.amplitude / omega * (Math.cos(spec.phase) - Math.cos(omega + spec.phase));
    return integral / total;
  }

  function opacityAt(progress) {
    if (progress < .08) return smootherStep(progress / .08);
    if (progress > .88) return 1 - smootherStep((progress - .88) / .12);
    return 1;
  }

  function lateralSway(progress, spec) {
    return Math.sin(Math.PI * progress) * Math.sin(Math.PI * 2 * spec.swayCycles * progress + spec.swayPhase) * spec.swayAmplitude;
  }

  function placeHeart(element, spec, progress) {
    const travel = integratedSpeed(progress, spec);
    const horizontal = smootherStep(progress);
    const startY = app.clientHeight + spec.bottomOffset;
    const x = spec.startX + (spec.endX - spec.startX) * horizontal + lateralSway(progress, spec);
    const y = startY + (spec.endY - startY) * travel;
    element.style.opacity = opacityAt(progress).toFixed(4);
    element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  }

  function resetScene() {
    hearts.forEach((element, index) => {
      const spec = heartSpecs[index];
      element.style.opacity = '0';
      element.style.transform = `translate3d(${spec.startX}px, ${app.clientHeight + spec.bottomOffset}px, 0)`;
    });
    toastAnimation?.cancel();
    clearTimeout(toastHideTimer);
    toast.style.opacity = '0';
    toast.style.transform = 'translate3d(0, 18px, 0) scale(.98)';
  }

  function clear() {
    runId += 1;
    cancelAnimationFrame(animationFrame);
    resetScene();
    layer.hidden = true;
    layer.dataset.state = 'idle';
  }

  function showToast() {
    toastAnimation = toast.animate([
      { opacity: 0, transform: 'translate3d(0, 18px, 0) scale(.98)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
    ], { duration: 340, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'forwards' });
  }

  function scheduleToastHide(currentRun) {
    clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => hideToast(currentRun), 5000);
  }

  function hideToast(currentRun) {
    if (currentRun !== runId) return;
    toastAnimation?.cancel();
    toastAnimation = toast.animate([
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
      { opacity: 0, transform: 'translate3d(0, 8px, 0) scale(.98)' }
    ], { duration: 220, easing: 'ease', fill: 'forwards' });
    toastAnimation.finished.then(() => {
      if (currentRun !== runId) return;
      layer.dataset.state = 'idle';
      layer.hidden = true;
    }).catch(() => {});
  }

  function play() {
    runId += 1;
    const currentRun = runId;
    cancelAnimationFrame(animationFrame);
    layer.hidden = false;
    layer.dataset.state = 'playing';
    layer.dataset.runs = String(Number(layer.dataset.runs || 0) + 1);
    resetScene();
    if (reducedMotion.matches) {
      toast.style.opacity = '1';
      toast.style.transform = 'none';
      layer.dataset.state = 'shown';
      scheduleToastHide(currentRun);
      return;
    }
    const startedAt = performance.now();
    let toastShown = false;
    function renderFrame(now) {
      if (currentRun !== runId) return;
      const elapsed = now - startedAt;
      hearts.forEach((element, index) => {
        const spec = heartSpecs[index];
        const progress = Math.max(0, Math.min(1, (elapsed - spec.delay) / spec.duration));
        placeHeart(element, spec, progress);
      });
      if (!toastShown && elapsed >= 780) {
        toastShown = true;
        showToast();
        scheduleToastHide(currentRun);
      }
      if (heartSpecs.some(spec => elapsed < spec.delay + spec.duration)) animationFrame = requestAnimationFrame(renderFrame);
      else layer.dataset.state = 'shown';
    }
    animationFrame = requestAnimationFrame(renderFrame);
  }

  reducedMotion.addEventListener('change', () => {
    if (!layer.hidden) play();
  });
  new MutationObserver(() => {
    if (document.querySelector('#screen').hidden) clear();
  }).observe(document.querySelector('#screen'), { attributes: true, attributeFilter: ['hidden'] });
  window.heartBalloonCelebration = { play, clear, heartSpecs };
})();
