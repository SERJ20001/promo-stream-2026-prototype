(() => {
  const stage = document.querySelector('#viewerStage');
  const choice = document.querySelector('#scenarioChoice');
  const app = document.querySelector('#app');
  const scenarioDeliveryState = { 'free-d-plus': true, 'free-d-minus': false };
  let ready = false;
  let selected = false;

  function fitDevice() {
    const scale = Math.min(1, Math.max(1, stage.clientWidth - 32) / 395, Math.max(1, stage.clientHeight - 32) / 832);
    stage.style.setProperty('--viewer-scale', String(scale));
  }

  function viewerMode() {
    const requested = new URLSearchParams(location.search).get('viewer');
    if (['phone', 'desktop'].includes(requested)) return requested;
    return matchMedia('(max-width: 499px)').matches ? 'phone' : 'desktop';
  }

  function selectScenario(scenario) {
    if (!ready || selected || !Object.prototype.hasOwnProperty.call(scenarioDeliveryState, scenario)) return;
    const delivery = scenarioDeliveryState[scenario];
    selected = true;
    stage.dataset.viewer = viewerMode();
    stage.hidden = false;
    fitDevice();
    choice.inert = true;
    choice.hidden = true;
    stage.inert = false;
    app.inert = false;
    app.removeAttribute('aria-busy');
    document.dispatchEvent(new CustomEvent('promo:scenario-selected', { detail: { scenario, delivery } }));
    document.dispatchEvent(new Event('promo:viewer-start'));
  }

  new ResizeObserver(fitDevice).observe(stage);
  choice.addEventListener('click', event => {
    const button = event.target.closest('[data-scenario]');
    if (button) selectScenario(button.dataset.scenario);
  });
  document.addEventListener('promo:assets-ready', () => {
    ready = true;
    document.querySelector('#assetGate').hidden = true;
    const search = new URLSearchParams(location.search);
    const requestedScenario = search.get('scenario');
    const qaBypass = search.get('qa') === '1' && (search.get('screen') || search.get('sheet'));
    if (['free-d-plus', 'free-d-minus'].includes(requestedScenario)) selectScenario(requestedScenario);
    else if (qaBypass) selectScenario('free-d-minus');
    else {
      choice.hidden = false;
      choice.inert = false;
      document.querySelector('#scenarioChoiceTitle').focus();
    }
  }, { once: true });
})();
