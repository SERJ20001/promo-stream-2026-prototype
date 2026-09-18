(() => {
  const stage = document.querySelector('#viewerStage');
  const choice = document.querySelector('#scenarioChoice');
  const app = document.querySelector('#app');
  const scenarioDeliveryState = { 'free-d-plus': true, 'free-d-minus': false };
  let ready = false;
  let selected = false;

  function selectScenario(scenario) {
    if (!ready || selected || !Object.prototype.hasOwnProperty.call(scenarioDeliveryState, scenario)) return;
    const delivery = scenarioDeliveryState[scenario];
    selected = true;
    stage.hidden = false;
    choice.inert = true;
    choice.hidden = true;
    stage.inert = false;
    app.inert = false;
    app.removeAttribute('aria-busy');
    document.dispatchEvent(new CustomEvent('promo:scenario-selected', { detail: { scenario, delivery } }));
    document.dispatchEvent(new Event('promo:viewer-start'));
  }

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
