(() => {
  const images = [
    'badge-delivery-off.png', 'badge-delivery-on.png', 'badge-quantity-off.png', 'badge-quantity-on.png',
    'badge-sale-off.png', 'badge-sale-on.png', 'continue-button.png', 'delivery-discount.png',
    'help-notification.png', 'icon-back.png', 'icon-chevron.png', 'icon-eye.png', 'icon-help.png', 'loading-spinner.png', 'question-outline.png',
    'old-price-header.png', 'old-price-sale.png', 'page-title.png', 'product-boots.png',
    'quantity-discount.png', 'sale-hvatamba.png', 'sale-lovita.png', 'sales-info.png', 'sales-timeline.png',
    'sheet-delivery-v38.png', 'sheet-hvatamba-v38.png', 'sheet-lovita-v38.png', 'sheet-methods.png',
    'sheet-promotion.png', 'sheet-quantity-v38.png', 'sheet-views.png', 'status-bar.png', 'toggle-off.png', 'toggle-on.png'
  ].map(name => `assets/${name}`).concat(Array.from({ length: 15 }, (_, index) => {
    const versions = { 3: '-v50', 6: '-v49', 13: '-v50' };
    return `assets/intro/flow-${index}${versions[index] || ''}.png`;
  }));
  const fonts = [
    { path: 'fonts/AvitoSansText-Regular.woff2', family: 'Avito Text', weight: '400' },
    { path: 'fonts/AvitoSansText-Bold.woff2', family: 'Avito Text', weight: '700' },
    { path: 'fonts/AvitoSansDisplay-Bold.woff2', family: 'Avito Display', weight: '700' }
  ];
  const styles = ['style.css?v=50', 'viewer.css?v=2'];
  const scripts = ['viewer.js?v=1', 'app.js?v=viewer-5', 'intro.js?v=viewer-4', 'confetti.js?v=46'];
  const resources = [...styles, ...images, ...fonts.map(font => font.path), ...scripts];
  const completed = new Map();
  const executed = new Set();
  const progress = document.querySelector('#assetGateProgress');
  const status = document.querySelector('#assetGateStatus');
  const retry = document.querySelector('#assetGateRetry');
  let running = false;
  let retrying = false;
  let scriptFailed = false;

  function timed(promise, path, cleanup = () => {}) {
    let timer;
    return Promise.race([
      promise,
      new Promise((resolve, reject) => {
        timer = setTimeout(() => { cleanup(); reject(new Error(path)); }, 25000);
      })
    ]).finally(() => clearTimeout(timer));
  }

  async function fetchResource(path) {
    const controller = new AbortController();
    return timed((async () => {
      const response = await fetch(path, { signal: controller.signal, cache: retrying ? 'reload' : 'default' });
      if (!response.ok) throw new Error(path);
      return response.blob();
    })(), path, () => controller.abort());
  }

  async function loadImage(path) {
    await fetchResource(path);
    const image = new Image();
    image.src = path;
    await timed(image.decode(), path, () => image.removeAttribute('src'));
    if (!image.naturalWidth) throw new Error(path);
    return image;
  }

  async function loadFont(font) {
    const face = new FontFace(font.family, `url("${font.path}")`, { weight: font.weight });
    await timed(face.load(), font.path);
    document.fonts.add(face);
    return face;
  }

  async function loadStyle(path) {
    await fetchResource(path);
    const current = [...document.querySelectorAll('link[rel="stylesheet"]')].find(link => link.getAttribute('href') === path);
    if (current?.sheet) return Promise.resolve(current);
    current?.remove();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    return timed(new Promise((resolve, reject) => {
      link.onload = () => resolve(link);
      link.onerror = () => { link.remove(); reject(new Error(path)); };
      document.head.append(link);
    }), path, () => link.remove());
  }

  async function prepare(path, load) {
    if (completed.has(path)) return;
    completed.set(path, await load());
    const percent = Math.round(completed.size / resources.length * 100);
    progress.style.width = `${percent}%`;
    status.textContent = `Подготавливаем ресурсы · ${percent}%`;
  }

  async function executeScript(path) {
    if (executed.has(path)) return;
    const script = document.createElement('script');
    script.src = path;
    let runtimeError;
    const captureError = event => {
      if (event.filename === script.src) runtimeError = new Error(path);
    };
    window.addEventListener('error', captureError);
    try {
      await timed(new Promise((resolve, reject) => {
        script.onload = () => runtimeError ? reject(runtimeError) : resolve();
        script.onerror = () => reject(new Error(path));
        document.body.append(script);
      }), path);
      executed.add(path);
    } catch (error) {
      scriptFailed = true;
      throw error;
    } finally {
      window.removeEventListener('error', captureError);
    }
  }

  async function boot() {
    if (running) return false;
    running = true;
    retry.hidden = true;
    document.querySelector('.assetGateTitle').textContent = 'Загружаем прототип';
    try {
      for (const path of styles) await prepare(path, () => loadStyle(path));
      const jobs = [
        ...images.map(path => () => prepare(path, () => loadImage(path))),
        ...fonts.map(font => () => prepare(font.path, () => loadFont(font))),
        ...scripts.map(path => () => prepare(path, () => fetchResource(path)))
      ];
      let next = 0;
      const failures = [];
      await Promise.all(Array.from({ length: 6 }, async () => {
        while (next < jobs.length) {
          const job = jobs[next++];
          try { await job(); } catch (error) { failures.push(error); }
        }
      }));
      if (failures.length) throw failures[0];
      for (const path of scripts) await executeScript(path);
      await timed(document.fonts.ready, 'fonts');
      await new Promise(requestAnimationFrame);
      document.body.dataset.assets = 'ready';
      document.dispatchEvent(new Event('promo:assets-ready'));
      return true;
    } catch {
      document.body.dataset.assets = 'error';
      document.querySelector('.assetGateTitle').textContent = 'Не удалось загрузить прототип';
      status.textContent = 'Проверьте соединение и повторите загрузку.';
      retry.hidden = false;
      retry.focus();
      return false;
    } finally {
      running = false;
    }
  }

  retry.addEventListener('click', () => {
    if (scriptFailed) return location.reload();
    retrying = true;
    window.__prototypeAssetsReady = boot();
  });
  window.__prototypeResources = resources;
  window.__prototypeAssetsReady = boot();
})();
