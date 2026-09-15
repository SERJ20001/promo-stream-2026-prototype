(() => {
  const stage = document.querySelector('#viewerStage');
  const choice = document.querySelector('#viewerChoice');
  const app = document.querySelector('#app');
  let ready = false;
  let selected = false;

  function fitDevice() {
    const scale = Math.min(1, Math.max(1, stage.clientWidth - 32) / 395, Math.max(1, stage.clientHeight - 32) / 832);
    stage.style.setProperty('--viewer-scale', String(scale));
  }

  function selectMode(mode) {
    if (!ready || selected || !['phone', 'desktop'].includes(mode)) return;
    selected = true;
    stage.dataset.viewer = mode;
    stage.hidden = false;
    fitDevice();
    choice.inert = true;
    choice.hidden = true;
    stage.inert = false;
    app.inert = false;
    app.removeAttribute('aria-busy');
    document.dispatchEvent(new Event('promo:viewer-start'));
  }

  new ResizeObserver(fitDevice).observe(stage);
  choice.addEventListener('click', event => {
    const button = event.target.closest('[data-viewer]');
    if (button) selectMode(button.dataset.viewer);
  });
  document.addEventListener('promo:assets-ready', () => {
    ready = true;
    document.querySelector('#assetGate').hidden = true;
    const requestedMode = new URLSearchParams(location.search).get('viewer');
    if (['phone', 'desktop'].includes(requestedMode)) selectMode(requestedMode);
    else {
      choice.hidden = false;
      choice.inert = false;
      document.querySelector('#viewerChoiceTitle').focus();
    }
  }, { once: true });
})();
