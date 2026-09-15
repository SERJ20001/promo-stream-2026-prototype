const defaults = { ...recommendationDefaults, hvatamba: false, delivery: false, quantity: false, hvatambaPercent: 20, deliveryAmount: 350, quantityPercent: 10, quantityCount: 3, paidServicesPaid: false };
let state = { ...defaults };
const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const basePrice = 5000;
const commissionRate = 3;
const currentPrice = () => state.hvatamba ? basePrice * (1 - state.hvatambaPercent / 100) : basePrice;
const hasPayoutAdjustments = () => state.hvatamba || state.delivery;
const commissionAmount = () => hasPayoutAdjustments() ? Math.floor(currentPrice() * commissionRate / 100 / 100) * 100 : 0;
const saleDiscountAmount = () => basePrice - currentPrice();
const discountKeys = ['hvatamba', 'delivery', 'quantity'];
const paidServiceKeys = ['promotion', 'xl', 'highlight'];
const enabledDiscountsCount = () => discountKeys.filter(key => state[key]).length;
const payoutAmount = () => Math.max(0, currentPrice() - commissionAmount() - (state.delivery ? state.deliveryAmount : 0));
const payoutText = () => money(payoutAmount());
let returnFocus;
let toastTimer;
let hasRendered = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let edgeTouch;
const verticalScrollerSelector = '.fixedSheetBody, .sheet, .introViewport, #scroll';
document.addEventListener('touchstart', event => {
  if (event.touches.length !== 1) {
    edgeTouch = null;
    return;
  }
  const touch = event.touches[0];
  edgeTouch = {
    x: touch.clientX,
    y: touch.clientY,
    scroller: event.target instanceof Element ? event.target.closest(verticalScrollerSelector) : null
  };
}, { passive: true });
document.addEventListener('touchmove', event => {
  if (!edgeTouch || event.touches.length !== 1) return;
  const touch = event.touches[0];
  const deltaX = touch.clientX - edgeTouch.x;
  const deltaY = touch.clientY - edgeTouch.y;
  edgeTouch.x = touch.clientX;
  edgeTouch.y = touch.clientY;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) return;
  const scroller = edgeTouch.scroller;
  if (!scroller) {
    event.preventDefault();
    return;
  }
  const cannotScroll = scroller.scrollHeight <= scroller.clientHeight + 1;
  const atTop = scroller.scrollTop <= 0;
  const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
  if (cannotScroll || atTop && deltaY > 0 || atBottom && deltaY < 0) event.preventDefault();
}, { passive: false });
for (const eventName of ['touchend', 'touchcancel']) {
  document.addEventListener(eventName, () => { edgeTouch = null; }, { passive: true });
}
document.documentElement.dataset.overscrollGuard = 'enabled';
function render() {
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
    node.classList.toggle('priceVisible', state.hvatamba);
    node.setAttribute('aria-hidden', String(!state.hvatamba));
  });
  const badges = [
    { key: 'sale', enabled: state.hvatamba, label: 'Распродажа', sheet: 'sales' },
    { key: 'delivery', enabled: state.delivery, label: 'Скидка на доставку', sheet: 'delivery' },
    { key: 'quantity', enabled: state.quantity, label: 'Скидка за количество', sheet: 'quantity' }
  ];
  all('[data-badges]').forEach(node => {
    if (!node.children.length) {
      node.innerHTML = badges.map(badge => `<span class="badge ${badge.key}Badge" role="img" aria-label="${badge.label}"><img class="badgeOff" src="assets/badge-${badge.key}-off.png" alt=""><img class="badgeOn" src="assets/badge-${badge.key}-on.png" alt=""></span>`).join('');
    }
    badges.forEach((badge, index) => node.children[index].classList.toggle('badgeEnabled', badge.enabled));
  });
  for (const sale of ['hvatamba']) {
    $(`[data-percent="${sale}"]`).textContent = state[`${sale}Percent`];
    $(`#${sale}Price`).textContent = money(5000 * (1 - state[`${sale}Percent`] / 100));
  }
  $('[data-payout]').textContent = payoutText();
  $('#deliveryValue').textContent = money(state.deliveryAmount);
  $('#quantityValue').textContent = `${state.quantityPercent}% от ${state.quantityCount} товаров`;
  renderRecommendations();
  hasRendered = true;
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('shown');
  toastTimer = setTimeout(() => $('#toast').classList.remove('shown'), 2400);
}
function closeSheet() {
  $('#overlay').hidden = true; $('#screen').inert = false; $('.sheet').classList.remove('sheetScrolled');
  $('.phone').classList.remove('sheetOpen');
  $('.viewerDisplay')?.classList.remove('sheetOpen');
  returnFocus?.focus({ preventScroll: true });
}
function sheet(title, body) {
  clearTimeout(toastTimer); $('#toast').classList.remove('shown');
  $('.sheet').classList.remove('figmaSheet', 'staticSheet', 'scoreSheet', 'totalFigmaSheet', 'totalCalculationSheet', 'fixedFooterSheet', 'sheetScrolled', 'sheetCloseAlwaysVisible');
  returnFocus = document.activeElement;
  $('#sheetContent').innerHTML = `<h2 id="sheetTitle">${title}</h2>${body}`;
  $('#overlay').hidden = false; $('#screen').inert = true;
  $('.phone').classList.add('sheetOpen');
  $('.viewerDisplay')?.classList.add('sheetOpen');
  $('.sheet').focus({ preventScroll: true });
}
const done = '<button class="primary" data-action="close">Понятно</button>';
function sheetSelection(name) {
  const patch = (x, y, width, height, content, extra = '') => `<div class="sheetValuePatch ${extra}" style="left:${x / 375 * 100}%;top:${y / 762 * 100}%;width:${width / 375 * 100}%;height:${height / 762 * 100}%">${content}</div>`;
  const chips = (values, selected, suffix) => values.map(value => `<span class="sheetChoice ${value === selected ? 'selected' : ''}">${value}${suffix}</span>`).join('');
  if (name === 'hvatamba') {
    const percent = state[`${name}Percent`];
    return patch(25, 326, 280, 30, `${percent}%`, 'fieldPatch')
      + patch(16, 373, 343, 36, chips([5, 10, 20, 30, 40], percent, '%'), 'chipsPatch')
      + patch(70, 612, 69, 24, money(5000 * (1 - percent / 100)), 'previewPricePatch');
  }
  if (name === 'delivery') {
    const position = Math.min(100, Math.max(0, (state.deliveryAmount - 50) / 1450 * 100));
    return patch(25, 337, 280, 36, money(state.deliveryAmount), 'fieldPatch')
      + patch(28, 373, 319, 18, `<span class="sheetSliderTrack"><span style="width:${position}%"></span><i style="left:${position}%"></i></span>`, 'sliderPatch')
      + patch(70, 612, 69, 24, money(currentPrice()), 'previewPricePatch')
      + (!state.hvatamba ? patch(139, 612, 70, 24, '') : '');
  }
  if (name === 'quantity') {
    return patch(16, 287, 343, 38, chips([5, 10, 15, 20, 30], state.quantityPercent, '%'), 'chipsPatch')
      + patch(16, 375, 359, 36, chips([2, 3, 5, 8, 10], state.quantityCount, ' товаров'), 'chipsPatch countPatch');
  }
  return '';
}
function openSheet(name) {
  if (recommendationSheet(name)) return;
  if (name === 'benefits') return sheet('Больше поводов купить', `<p>Выберите преимущества объявления: участие в распродаже, скидку на доставку или на несколько товаров.</p><p>Бейджи над карточками показывают, что вы подключили. Пунктирные бейджи — ещё не подключённые преимущества.</p>${done}`);
  if (name === 'total') return sheet('Вы получите за товар', `<div class="receipt"><span>Цена с текущей скидкой</span><strong>${money(currentPrice())}</strong><span>Скидка на доставку</span><strong>${state.delivery ? `до ${money(state.deliveryAmount)}` : 'Не подключена'}</strong><span>Вы получите</span><strong>${payoutText()}</strong></div><p>${state.delivery ? 'Скидка на доставку может потратиться частично или не потратиться. Первая сумма — если она не расходуется, вторая — если используется полностью.' : 'Скидка на доставку выключена, поэтому показываем одну сумму.'}</p>${done}`);
  const sheets = {
    hvatamba: { title: 'Хватамба', height: 762, footerTop: 590, actionTop: 668, actionHeight: 52 },
    delivery: { title: 'Скидка на доставку', height: 762, footerTop: 590, actionTop: 668, actionHeight: 52 },
    quantity: { title: 'Скидка за количество', height: 762, footerTop: 648, actionTop: 668, actionHeight: 52 },
    methods: { title: 'Способы продажи', height: 862, footerTop: 750, actionTop: 766, actionHeight: 52 },
    views: { title: 'Цена просмотра', height: 756, footerTop: 604, actionTop: 614, actionHeight: 110 },
    promotion: { title: 'Продвижение', height: 948, footerTop: 844, actionTop: 854, actionHeight: 52 }
  };
  const preview = sheets[name];
  if (!preview) return;
  const imageSource = name === 'promotion' ? 'assets/sheet-promotion-v43.png' : `assets/sheet-${name}.png`;
  const footerHeight = preview.height - preview.footerTop;
  const footerOffset = preview.footerTop / preview.height * 100;
  const actionOffset = (preview.actionTop - preview.footerTop) / footerHeight * 100;
  const actionHeight = preview.actionHeight / footerHeight * 100;
  sheet(preview.title, `<div class="fixedSheetLayout"><div class="fixedSheetBody"><div class="fixedSheetBodyCrop" style="aspect-ratio:375/${preview.footerTop}"><div class="figmaSheetCanvas fixedSheetCanvas" style="aspect-ratio:375/${preview.height}"><img class="figmaSheetImage" src="${imageSource}" width="375" height="${preview.height}" alt="${preview.title}. Статичный макет настроек.">${sheetSelection(name)}</div></div></div><div class="fixedSheetFooter" style="aspect-ratio:375/${footerHeight}"><div class="figmaSheetCanvas fixedSheetFooterSource" style="aspect-ratio:375/${preview.height}"><img class="figmaSheetImage" src="${imageSource}" width="375" height="${preview.height}" alt="">${sheetSelection(name)}</div><button class="sheetDoneHotspot" data-action="close" aria-label="Закрыть шторку" style="top:${actionOffset}%;height:${actionHeight}%"></button></div></div>`);
  $('.fixedSheetFooterSource').style.transform = `translateY(-${footerOffset}%)`;
  $('.sheet').style.setProperty('--sheet-height', `${preview.height}px`);
  $('.sheet').classList.add('figmaSheet', 'staticSheet', 'fixedFooterSheet');
  if (name === 'methods' || name === 'views') $('.sheet').classList.add('sheetCloseAlwaysVisible');
  const bodyScroller = $('.fixedSheetBody');
  bodyScroller.scrollTop = 0;
  bodyScroller.addEventListener('scroll', () => {
    $('.sheet').classList.toggle('sheetScrolled', bodyScroller.scrollTop > 24);
  }, { passive: true });
}
function summary(saved = false) {
  const items = [state.hvatamba && `Хватамба — ${state.hvatambaPercent}% сейчас`, state.delivery && `Скидка на доставку — ${money(state.deliveryAmount)}`, state.quantity && `${state.quantityPercent}% от ${state.quantityCount} товаров`].filter(Boolean);
  for (const [key, label] of [['promotion', 'Продвижение'], ['xl', 'Большой размер объявления'], ['highlight', 'Выделение цены цветом']]) {
    if (state[key]) items.push(`${label} — 7 дней, ${money(100)}`);
  }
  items.push(`Привлекательность — ${attractivenessScore(state)}%`);
  sheet(saved ? 'Настройки сохранены' : 'Всё готово', `<img class="summaryPhoto" src="assets/product-boots.png" alt="Ботинки Hermes"><h3>Ботинки Hermes</h3><div class="summaryPrice">${money(currentPrice())}</div><ul class="summaryList">${items.length ? items.map(item => `<li>${item}</li>`).join('') : '<li>Без дополнительных скидок</li>'}</ul><p class="muted">${saved ? 'Выбор сохранён в этом браузере.' : 'Предпросмотр настроек. Реальное объявление не изменено.'}</p><button class="primary" data-action="close">Вернуться к настройкам</button><button class="textButton" data-action="reset">Начать заново</button>`);
}
document.addEventListener('click', event => {
  const button = event.target.closest('button, [data-action]'); if (!button) return;
  if (button.dataset.toggle) {
    const previousDiscountsCount = enabledDiscountsCount();
    const wasEnabled = state[button.dataset.toggle];
    state[button.dataset.toggle] = !wasEnabled;
    if (paidServiceKeys.includes(button.dataset.toggle)) state.paidServicesPaid = false;
    render();
    const nextDiscountsCount = enabledDiscountsCount();
    if (discountKeys.includes(button.dataset.toggle) && !wasEnabled && previousDiscountsCount < 2 && nextDiscountsCount >= 2) window.heartBalloonCelebration?.play();
    else if (nextDiscountsCount < 2) window.heartBalloonCelebration?.clear();
    return;
  }
  if (button.dataset.sheet) return openSheet(button.dataset.sheet);
  switch (button.dataset.action) {
    case 'close': return closeSheet();
    case 'complete':
      if (paidServicesTotal(state) > 0 && !state.paidServicesPaid) return window.startPaymentFlow?.(paidServicesTotal(state));
      return summary();
    case 'save':
      try { localStorage.setItem('promo-stream-selection-v1', JSON.stringify(state)); summary(true); } catch { toast('Не удалось сохранить настройки в браузере'); }
      return;
    case 'reset': state = { ...defaults }; photoFiles.clear(); try { localStorage.removeItem('promo-stream-selection-v1'); } catch {} closeSheet(); render(); $('#scroll').scrollTo({ top: 0, behavior: 'smooth' }); all('.recommendationCarousel').forEach(carousel => carousel.scrollTo({ left: 0 })); return;
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
$('.sheet').addEventListener('scroll', event => {
  event.currentTarget.classList.toggle('sheetScrolled', event.currentTarget.classList.contains('figmaSheet') && event.currentTarget.scrollTop > 24);
}, { passive: true });
$('#scroll').addEventListener('scroll', () => {
  const scrollTop = $('#scroll').scrollTop;
  const compact = scrollTop > 205;
  $('#header').classList.toggle('headerScrolled', scrollTop > 0);
  $('#header').classList.toggle('headerCompact', compact); $('.compactWrap').setAttribute('aria-hidden', String(!compact)); $('.compactWrap').inert = !compact;
}, { passive: true });
$('.compactWrap').inert = true;
render();

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const tool = {
    name: 'configure_promo_selection',
    title: 'Выбрать акции прототипа',
    description: 'Изменяет только переключатели в демо. Не сохраняет и не меняет реальное объявление.',
    inputSchema: { type: 'object', properties: Object.fromEntries(['hvatamba', 'delivery', 'quantity'].map(key => [key, { type: 'boolean' }])), additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const allowed = ['hvatamba', 'delivery', 'quantity'];
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.entries(input).some(([key, value]) => !allowed.includes(key) || typeof value !== 'boolean')) throw new Error('Нужны только булевы значения переключателей.');
      const previousDiscountsCount = enabledDiscountsCount();
      Object.assign(state, input);
      render();
      const nextDiscountsCount = enabledDiscountsCount();
      if (previousDiscountsCount < 2 && nextDiscountsCount >= 2) window.heartBalloonCelebration?.play();
      else if (nextDiscountsCount < 2) window.heartBalloonCelebration?.clear();
      return { selection: Object.fromEntries(allowed.map(key => [key, state[key]])), currentPrice: currentPrice() };
    }
  };
  try { Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(error => console.warn('WebMCP registration:', error.message)); }
  catch (error) { console.warn('WebMCP registration:', error.message); }
  window.addEventListener('pagehide', event => { if (!event.persisted) lifecycle.abort(); }, { once: true });
}
