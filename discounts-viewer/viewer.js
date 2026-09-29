(() => {
  const stage = document.querySelector('#viewerStage');
  const choice = document.querySelector('#scenarioChoice');
  const app = document.querySelector('#app');
  let ready = false;
  let selected = false;

  function selectScenario(scenario) {
    if (!ready || selected || !['free-d-plus', 'free-d-minus'].includes(scenario)) return;
    selected = true;
    stage.dataset.scenario = scenario;
    stage.hidden = false;
    choice.inert = true;
    choice.hidden = true;
    stage.inert = false;
    app.inert = false;
    app.removeAttribute('aria-busy');
    document.dispatchEvent(new CustomEvent('promo:scenario-selected', {
      detail: { delivery: scenario === 'free-d-plus', scenario }
    }));
    document.dispatchEvent(new Event('promo:viewer-start'));
  }

  function returnToChoice() {
    if (!selected) return;
    selected = false;
    stage.inert = true;
    stage.hidden = true;
    delete stage.dataset.scenario;
    app.inert = true;
    choice.hidden = false;
    choice.inert = false;
    choice.focus();
  }

  choice.addEventListener('click', event => {
    const button = event.target.closest('[data-scenario]');
    if (button) selectScenario(button.dataset.scenario);
  });
  document.addEventListener('promo:viewer-back', returnToChoice);
  document.addEventListener('promo:assets-ready', () => {
    ready = true;
    document.querySelector('#assetGate').hidden = true;
    choice.hidden = false;
    choice.inert = false;
    choice.focus();
  }, { once: true });
})();
