(() => {
  const rootAssets = [
    'badge-delivery-off.png', 'badge-delivery-on.png', 'badge-quantity-off.png', 'badge-quantity-on.png',
    'badge-sale-off.png', 'badge-sale-on.png', 'continue-button.png', 'delivery-discount.png',
    'help-notification.png', 'icon-back.png', 'icon-chevron.png', 'icon-eye.png', 'icon-help.png',
    'old-price-header.png', 'old-price-sale.png', 'page-title.png', 'product-boots.png',
    'quantity-discount.png', 'sale-hvatamba.png', 'sale-lovita.png', 'sales-info.png', 'sales-timeline.png',
    'sheet-delivery-v38.png', 'sheet-hvatamba-v38.png', 'sheet-lovita-v38.png', 'sheet-methods.png',
    'sheet-promotion.png', 'sheet-quantity-v38.png', 'sheet-views.png', 'status-bar.png', 'toggle-off.png', 'toggle-on.png'
  ].map(name => `assets/${name}`);
  const introAssets = Array.from({ length: 10 }, (_, index) => `assets/intro/flow-${index}.png`);
  const fontAssets = [
    'fonts/AvitoSansText-Regular.woff2',
    'fonts/AvitoSansText-Bold.woff2',
    'fonts/AvitoSansDisplay-Bold.woff2'
  ];
  const gate = document.querySelector('#assetGate');
  const progress = document.querySelector('#assetGateProgress');
  const status = document.querySelector('#assetGateStatus');
  const app = document.querySelector('#app');
  const total = rootAssets.length + introAssets.length + fontAssets.length;
  let ready = 0;
  const markReady = () => {
    ready += 1;
    const percent = Math.round(ready / total * 100);
    progress.style.width = `${percent}%`;
    status.textContent = `Подготавливаем графику · ${percent}%`;
  };
  const loadImage = path => new Promise(resolve => {
    const image = new Image();
    const complete = async () => {
      try {
        if (image.decode) await image.decode();
      } catch {}
      markReady();
      resolve();
    };
    image.onload = complete;
    image.onerror = complete;
    image.src = path;
  });
  const loadFont = path => fetch(path, { cache: 'force-cache' })
    .catch(() => undefined)
    .finally(markReady);
  window.__prototypeAssetsReady = Promise.all([
    ...rootAssets.map(loadImage),
    ...introAssets.map(loadImage),
    ...fontAssets.map(loadFont)
  ]).then(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    status.textContent = 'Готово';
    progress.style.width = '100%';
    app.removeAttribute('aria-busy');
    gate.classList.add('assetGateLeaving');
    setTimeout(() => gate.remove(), 180);
  });
})();
