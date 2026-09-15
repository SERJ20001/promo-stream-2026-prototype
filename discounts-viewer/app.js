const defaults = { hvatamba: false, lovita: false, delivery: false, quantity: false, hvatambaPercent: 20, lovitaPercent: 10, deliveryAmount: 350, quantityPercent: 10, quantityCount: 3 };
let state = { ...defaults };
const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const basePrice = 5000;
const commissionRate = 3;
const activeSalePercent = () => state.hvatamba ? state.hvatambaPercent : state.lovita ? state.lovitaPercent : 0;
const currentPrice = () => basePrice * (1 - activeSalePercent() / 100);
const commissionAmount = () => currentPrice() * commissionRate / 100;
const saleDiscountAmount = () => basePrice - currentPrice();
const payoutAmount = () => Math.max(0, currentPrice() - commissionAmount() - (state.delivery ? state.deliveryAmount : 0));
const payoutText = () => money(payoutAmount());
let returnFocus;
let toastTimer;
let deliveryHintTimer;
let deliveryHintHideTimer;
let hasRendered = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function render() {
  $('.help').classList.toggle('hasNotification', state.hvatamba && state.lovita);
  all('[data-toggle]').forEach(button => {
    const enabled = state[button.dataset.toggle];
    button.setAttribute('aria-checked', String(enabled));
    button.querySelector('img').src = `assets/toggle-${enabled ? 'on' : 'off'}.png`;
  });
  all('[data-price]').forEach(node => {
    const nextPrice = money(currentPrice());
    if (node.textContent === nextPrice) return;
    node.textContent = nextPrice;
    node.getAnimations().forEach(animation => animation.cancel());
    if (hasRendered && !reducedMotion.matches) node.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
  all('[data-old]').forEach(node => {
    node.hidden = false;
    const hasActiveSale = activeSalePercent() > 0;
    node.classList.toggle('priceVisible', hasActiveSale);
    node.setAttribute('aria-hidden', String(!hasActiveSale));
  });
  const badges = [
    { key: 'sale', enabled: state.hvatamba || state.lovita, label: 'Распродажа', sheet: 'sales' },
    { key: 'delivery', enabled: state.delivery, label: 'Скидка на доставку', sheet: 'delivery' },
    { key: 'quantity', enabled: state.quantity, label: 'Скидка за количество', sheet: 'quantity' }
  ];
  all('[data-badges]').forEach(node => {
    if (!node.children.length) {
      node.innerHTML = badges.map(badge => `<span class="badge ${badge.key}Badge" role="img" aria-label="${badge.label}"><img class="badgeOff" src="assets/badge-${badge.key}-off.png" alt=""><img class="badgeOn" src="assets/badge-${badge.key}-on.png" alt=""></span>`).join('');
    }
    badges.forEach((badge, index) => node.children[index].classList.toggle('badgeEnabled', badge.enabled));
  });
  for (const sale of ['hvatamba', 'lovita']) {
    $(`[data-percent="${sale}"]`).textContent = state[`${sale}Percent`];
    $(`#${sale}Price`).textContent = money(5000 * (1 - state[`${sale}Percent`] / 100));
  }
  $('[data-payout]').textContent = payoutText();
  $('#deliveryValue').textContent = money(state.deliveryAmount);
  $('#quantityValue').textContent = `${state.quantityPercent}% от ${state.quantityCount} товаров`;
  hasRendered = true;
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('shown');
  toastTimer = setTimeout(() => $('#toast').classList.remove('shown'), 2400);
}
function closeSheet() {
  clearTimeout(deliveryHintTimer);
  clearTimeout(deliveryHintHideTimer);
  $('#overlay').hidden = true; $('#screen').inert = false;
  returnFocus?.focus({ preventScroll: true });
}
function sheet(title, body) {
  clearTimeout(toastTimer); $('#toast').classList.remove('shown');
  $('.sheet').classList.remove('figmaSheet', 'staticSheet', 'totalSheet');
  returnFocus = document.activeElement;
  $('#sheetContent').innerHTML = `<h2 id="sheetTitle">${title}</h2>${body}`;
  $('#overlay').hidden = false; $('#screen').inert = true;
  $('.sheet').focus({ preventScroll: true });
}
const done = '<button class="primary" data-action="close">Понятно</button>';
function sheetSelection(name) {
  const patch = (x, y, width, height, content, extra = '') => `<div class="sheetValuePatch ${extra}" style="left:${x / 375 * 100}%;top:${y / 762 * 100}%;width:${width / 375 * 100}%;height:${height / 762 * 100}%">${content}</div>`;
  const chips = (values, selected, suffix) => values.map(value => `<span class="sheetChoice ${value === selected ? 'selected' : ''}">${value}${suffix}</span>`).join('');
  if (name === 'hvatamba' || name === 'lovita') {
    const percent = state[`${name}Percent`];
    return patch(25, 326, 280, 30, `${percent}%`, 'fieldPatch')
      + patch(16, 373, 343, 36, chips([5, 10, 20, 30, 40], percent, '%'), 'chipsPatch')
      + patch(66, 644, 72, 22, money(5000 * (1 - percent / 100)), 'previewPricePatch');
  }
  if (name === 'delivery') {
    const position = Math.min(100, Math.max(0, (state.deliveryAmount - 50) / 1450 * 100));
    return patch(25, 337, 280, 36, money(state.deliveryAmount), 'fieldPatch')
      + patch(28, 373, 319, 18, `<span class="sheetSliderTrack"><span style="width:${position}%"></span><i style="left:${position}%"></i></span>`, 'sliderPatch')
      + patch(66, 644, 72, 22, money(currentPrice()), 'previewPricePatch')
      + (!state.hvatamba ? patch(138, 644, 70, 22, '') : '');
  }
  if (name === 'quantity') {
    return patch(16, 287, 343, 38, chips([5, 10, 15, 20, 30], state.quantityPercent, '%'), 'chipsPatch')
      + patch(16, 375, 359, 36, chips([2, 3, 5, 8, 10], state.quantityCount, ' товаров'), 'chipsPatch countPatch');
  }
  return '';
}
function openSheet(name) {
  if (name === 'sales') {
    const timeline = state.hvatamba && state.lovita;
    const description = timeline
      ? `Цена с учётом подключённых скидок: Хватамба с 12 августа — ${money(5000 * (1 - state.hvatambaPercent / 100))}; Ловита с 20 сентября — ${money(5000 * (1 - state.lovitaPercent / 100))}; с 12 декабря — 5 000 ₽. Скидки действуют последовательно, цена меняется автоматически.`
      : 'Чем больше распродаж вы подключите, тем дольше будем выделять ваш товар как распродажный. Вступайте во все доступные распродажи. Когда одна закончится, активируется скидка в следующей. Ваш товар получит максимум возможностей от всех распродаж.';
    sheet('Больше распродаж, чтобы скидки не заканчивались', `<div class="figmaSheetCanvas"><img class="figmaSheetImage" src="assets/sales-${timeline ? 'timeline' : 'info'}.png" alt="${description}">${timeline ? `<span class="timelinePrice firstPrice">${money(5000 * (1 - state.hvatambaPercent / 100))}</span><span class="timelinePrice secondPrice">${money(5000 * (1 - state.lovitaPercent / 100))}</span>` : ''}</div>`);
    $('.sheet').classList.add('figmaSheet');
    return;
  }
  if (name === 'benefits') return sheet('Больше поводов купить', `<p>Выберите преимущества объявления: участие в распродаже, скидку на доставку или на несколько товаров.</p><p>Бейджи над карточками показывают, что вы подключили. Пунктирные бейджи — ещё не подключённые преимущества.</p>${done}`);
  if (name === 'total') {
    const rows = [
      { label: 'Ваша цена', value: money(basePrice), className: 'totalBaseRow' },
      { label: `Комиссия за продажу<br>с доставкой ${commissionRate}%`, value: money(commissionAmount()) },
      activeSalePercent() && { label: 'Скидка в распродаже', value: money(saleDiscountAmount()) },
      state.delivery && { label: 'Скидка на доставку', value: money(state.deliveryAmount), interactive: true }
    ].filter(Boolean);
    const receiptRows = rows.map(({ label, value, interactive, className = '' }) => `<${interactive ? 'button' : 'div'} class="totalRow${interactive ? ' totalInfoRow' : ''}${className ? ` ${className}` : ''}"${interactive ? ' data-action="delivery-info" aria-describedby="deliveryHint"' : ''}><span>${label}${interactive ? '<img class="totalInfoIcon" src="assets/question-outline.png" alt="">' : ''}</span><i></i><strong>${value}</strong></${interactive ? 'button' : 'div'}>`).join('');
    sheet('Итого', `<div class="totalSheetBody"><div class="totalReceipt">${receiptRows}<div class="totalRow totalResult"><span>Придёт за товар<br>когда его купят</span><i></i><strong>${payoutText()}</strong></div></div></div><div class="deliveryHint" id="deliveryHint" role="status" hidden>Вычтем меньше, если доставка выйдет дешевле</div><div class="totalSheetFooter"><button class="primary" data-action="close">Готово</button></div>`);
    $('.sheet').classList.add('totalSheet');
    $('.sheet').style.setProperty('--total-sheet-height', `${230 + rows.length * 30}px`);
    $('.totalSheetBody').scrollTop = 0;
    return;
  }
  const sheets = {
    hvatamba: { title: 'Хватамба', height: 762 },
    lovita: { title: 'Ловита', height: 762 },
    delivery: { title: 'Скидка на доставку', height: 762 },
    quantity: { title: 'Скидка за количество', height: 762 },
    methods: { title: 'Способы продажи', height: 862 },
    views: { title: 'Цена просмотра', height: 756 },
    promotion: { title: 'Продвижение', height: 948 }
  };
  const preview = sheets[name];
  if (!preview) return;
  const footerHeight = ['hvatamba', 'lovita', 'delivery'].includes(name) ? 132 : name === 'quantity' ? 76 : 100;
  const bodyHeight = preview.height - footerHeight;
  const canvas = `<div class="figmaSheetCanvas"><img class="figmaSheetImage" src="assets/sheet-${name}${['hvatamba', 'lovita', 'delivery', 'quantity'].includes(name) ? '-v38' : ''}.png" width="375" height="${preview.height}" alt="${preview.title}. Статичный макет настроек.">${sheetSelection(name)}</div>`;
  sheet(preview.title, `<div class="sheetBodyScroll"><div class="sheetBodyCrop" style="aspect-ratio:375/${bodyHeight}">${canvas}</div></div><div class="sheetFixedFooter" style="aspect-ratio:375/${footerHeight}"><div class="sheetFooterImage" style="transform:translateY(-${bodyHeight / preview.height * 100}%)">${canvas}</div><button class="sheetDoneHotspot" data-action="close" aria-label="Закрыть шторку" style="height:${Math.min(76, footerHeight) / footerHeight * 100}%"></button></div>`);
  $('.sheet').classList.add('figmaSheet', 'staticSheet');
  $('.sheet').scrollTop = 0;
}
function summary(saved = false) {
  const items = [state.hvatamba && `Хватамба — ${state.hvatambaPercent}% сейчас`, state.lovita && `Ловита — ${state.lovitaPercent}% после Хватамбы`, state.delivery && `Скидка на доставку — ${money(state.deliveryAmount)}`, state.quantity && `${state.quantityPercent}% от ${state.quantityCount} товаров`].filter(Boolean);
  sheet(saved ? 'Настройки сохранены' : 'Всё готово', `<img class="summaryPhoto" src="assets/product-boots.png" alt="Ботинки Hermes"><h3>Ботинки Hermes</h3><div class="summaryPrice">${money(currentPrice())}</div><ul class="summaryList">${items.length ? items.map(item => `<li>${item}</li>`).join('') : '<li>Без дополнительных скидок</li>'}</ul><p class="muted">${saved ? 'Выбор сохранён в этом браузере.' : 'Предпросмотр настроек. Реальное объявление не изменено.'}</p><button class="primary" data-action="close">Вернуться к настройкам</button><button class="textButton" data-action="reset">Начать заново</button>`);
}
document.addEventListener('click', event => {
  const button = event.target.closest('button, [data-action]'); if (!button) return;
  if (button.dataset.toggle) { state[button.dataset.toggle] = !state[button.dataset.toggle]; render(); return; }
  if (button.dataset.sheet) return openSheet(button.dataset.sheet);
  switch (button.dataset.action) {
    case 'close': return closeSheet();
    case 'delivery-info': {
      const hint = $('#deliveryHint');
      if (!hint) return;
      clearTimeout(deliveryHintTimer);
      clearTimeout(deliveryHintHideTimer);
      hint.hidden = false;
      requestAnimationFrame(() => hint.classList.add('shown'));
      deliveryHintTimer = setTimeout(() => {
        hint.classList.remove('shown');
        deliveryHintHideTimer = setTimeout(() => { hint.hidden = true; }, 180);
      }, 4000);
      return;
    }
    case 'save':
      try { localStorage.setItem('promo-stream-selection-v1', JSON.stringify(state)); summary(true); } catch { toast('Не удалось сохранить настройки в браузере'); }
      return;
    case 'reset': state = { ...defaults }; try { localStorage.removeItem('promo-stream-selection-v1'); } catch {} closeSheet(); render(); $('#scroll').scrollTo({ top: 0, behavior: 'smooth' }); $('#carousel').scrollTo({ left: 0 }); return;
    case 'back': if ($('#scroll').scrollTop > 0) $('#scroll').scrollTo({ top: 0, behavior: 'smooth' }); else sheet('Вернуться назад?', `<p>Вы можете продолжить настройку или начать выбор скидок заново.</p><button class="primary" data-action="close">Остаться</button><button class="textButton" data-action="reset">Начать заново</button>`);
  }
});
document.addEventListener('keydown', event => {
  if ($('#overlay').hidden) return;
  if (event.key === 'Escape') closeSheet();
  if (event.key === 'Tab') {
    const controls = [...$('.sheet').querySelectorAll('button, input:checked, select')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === $('.sheet'))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
$('#scroll').addEventListener('scroll', () => {
  const compact = $('#scroll').scrollTop > 205;
  $('#header').classList.toggle('headerCompact', compact); $('.compactWrap').setAttribute('aria-hidden', String(!compact)); $('.compactWrap').inert = !compact;
}, { passive: true });
$('#carousel').addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); $('#carousel').scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * 333, behavior: 'smooth' }); }
});
$('.compactWrap').inert = true;
render();
for (const name of ['badge-sale', 'badge-delivery', 'badge-quantity', 'toggle']) {
  for (const variant of ['on', 'off']) {
    const image = new Image();
    image.src = `assets/${name}-${variant}.png`;
  }
}

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const tool = {
    name: 'configure_promo_selection',
    title: 'Выбрать акции прототипа',
    description: 'Изменяет только переключатели в демо. Не сохраняет и не меняет реальное объявление.',
    inputSchema: { type: 'object', properties: Object.fromEntries(['hvatamba', 'lovita', 'delivery', 'quantity'].map(key => [key, { type: 'boolean' }])), additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const allowed = ['hvatamba', 'lovita', 'delivery', 'quantity'];
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.entries(input).some(([key, value]) => !allowed.includes(key) || typeof value !== 'boolean')) throw new Error('Нужны только булевы значения переключателей.');
      Object.assign(state, input);
      render();
      return { selection: Object.fromEntries(allowed.map(key => [key, state[key]])), currentPrice: currentPrice() };
    }
  };
  try { Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(error => console.warn('WebMCP registration:', error.message)); }
  catch (error) { console.warn('WebMCP registration:', error.message); }
  window.addEventListener('pagehide', event => { if (!event.persisted) lifecycle.abort(); }, { once: true });
}

for (const name of ['hvatamba', 'lovita', 'delivery', 'quantity', 'methods', 'views', 'promotion']) {
  const preview = new Image();
  preview.src = `assets/sheet-${name}${['hvatamba', 'lovita', 'delivery', 'quantity'].includes(name) ? '-v38' : ''}.png`;
}
