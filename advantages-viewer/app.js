const defaults = { ...recommendationDefaults, hvatamba: false, delivery: false, deliveryPreEnabled: false, quantity: false, hvatambaPercent: 20, deliveryAmount: 350, quantityPercent: 10, quantityCount: 3, quantityScope: 'all', promotionDays: 7, promotionBudget: 200, pickup: false, saleDelivery: false, paidServicesPaid: false };
let state = { ...defaults };
let sheetDraft = null;
const sheetDraftFields = {
  hvatamba: ['hvatambaPercent'],
  delivery: ['deliveryAmount'],
  quantity: ['quantityPercent', 'quantityCount', 'quantityScope'],
  promotion: ['promotionDays', 'promotionBudget'],
  methods: ['pickup', 'saleDelivery']
};
const formatAmount = value => new Intl.NumberFormat('ru-RU').format(value);
const money = value => `${formatAmount(value)} ₽`;
const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const basePrice = 5000;
const commissionRate = 10;
const currentPrice = () => state.hvatamba ? basePrice * (1 - state.hvatambaPercent / 100) : basePrice;
const commissionAmount = () => Math.round(basePrice * commissionRate / 100);
const saleDiscountAmount = () => basePrice - currentPrice();
const discountKeys = ['hvatamba', 'delivery', 'quantity'];
const paidServiceKeys = ['promotion', 'xl', 'highlight'];
const enabledDiscountsCount = () => discountKeys.filter(key => state[key]).length;
const payoutBeforeDelivery = () => Math.max(0, currentPrice() - commissionAmount());
const payoutAmount = () => Math.max(0, payoutBeforeDelivery() - (state.delivery ? state.deliveryAmount : 0));
const payoutText = () => state.delivery ? `${formatAmount(payoutBeforeDelivery())} – ${money(payoutAmount())}` : money(payoutBeforeDelivery());
let returnFocus;
let toastTimer;
let commissionTooltipTimer;
let hasRendered = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let edgeTouch;
const verticalScrollerSelector = '.totalCalculationBody, .fixedSheetBody, .sheet, .introViewport, #scroll';
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
    button.classList.toggle('toggleEnabled', enabled);
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
    { key: 'delivery', enabled: state.delivery, label: 'Скидка на доставку', sheet: 'delivery' },
    { key: 'quantity', enabled: state.quantity, label: 'Скидка за количество', sheet: 'quantity' }
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
  $('#quantityValue').textContent = `${state.quantityPercent}% от ${state.quantityCount} товаров`;
  renderRecommendations();
  hasRendered = true;
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('shown');
  toastTimer = setTimeout(() => $('#toast').classList.remove('shown'), 2400);
}
function beginSheetDraft(name) {
  const fields = sheetDraftFields[name];
  if (!fields) return false;
  sheetDraft = Object.fromEntries(fields.map(field => [field, state[field]]));
  return true;
}
function sheetValue(field) {
  return sheetDraft && Object.prototype.hasOwnProperty.call(sheetDraft, field) ? sheetDraft[field] : state[field];
}
function clearSheetDraft() {
  sheetDraft = null;
}
function applySheetDraft() {
  if (sheetDraft) Object.assign(state, sheetDraft);
  clearSheetDraft();
  render();
  closeSheet();
}
function closeSheet() {
  clearTimeout(commissionTooltipTimer);
  clearSheetDraft();
  $('#overlay').hidden = true; $('#screen').inert = false; $('.sheet').classList.remove('sheetScrolled');
  $('.phone').classList.remove('sheetOpen');
  $('.viewerDisplay')?.classList.remove('sheetOpen');
  returnFocus?.focus({ preventScroll: true });
}
function sheet(title, body) {
  clearTimeout(toastTimer); $('#toast').classList.remove('shown');
  clearTimeout(commissionTooltipTimer);
  window.heartBalloonCelebration?.clear();
  $('.sheet').classList.remove('figmaSheet', 'staticSheet', 'scoreSheet', 'totalFigmaSheet', 'totalCalculationSheet', 'fixedFooterSheet', 'codedSheetShell', 'sheetScrolled', 'sheetCloseAlwaysVisible');
  if ($('#overlay').hidden) returnFocus = document.activeElement;
  $('#sheetContent').innerHTML = `<h2 id="sheetTitle">${title}</h2>${body}`;
  $('#overlay').hidden = false; $('#screen').inert = true;
  $('.phone').classList.add('sheetOpen');
  $('.viewerDisplay')?.classList.add('sheetOpen');
  $('.sheet').focus({ preventScroll: true });
}
const done = '<button class="primary" data-action="close">Понятно</button>';
function choiceButtons(values, selected, suffix, field) {
  return values.map(value => `<button type="button" class="codedChoice ${value === selected ? 'selected' : ''}" data-sheet-choice="${field}" data-value="${value}">${value}${suffix}</button>`).join('');
}
function sheetProductSnippet(price, showOldPrice) {
  return `<div class="sheetProductSnippet"><img src="assets/product-sneakers-v98.png" alt="Кроссовки Nike"><div><div class="sheetProductPrice"><strong>${money(price)}</strong>${showOldPrice ? '<del>5 000 ₽</del>' : ''}</div><span>Кроссовки Nike</span></div></div>`;
}
function codedSheet(name) {
  if (name === 'hvatamba') {
    const hvatambaPercent = sheetValue('hvatambaPercent');
    const price = basePrice * (1 - hvatambaPercent / 100);
    return {
      title: 'Хватамба',
      height: 762,
      body: `<div class="codedSheet" data-coded-sheet="hvatamba"><div class="codedSheetMain"><img class="codedHero" src="assets/sheets/hvatamba-hero.png" width="375" height="185" alt=""><div class="codedSheetCopy"><h3>Хватамба</h3><p>Объявление станет заметнее — появится<br>значок «Скидка» и перечёркнутая цена.<br>Скидку проверим <button class="inlineLink" type="button">по правилам</button></p><label class="codedInput"><span class="codedInputValue"><input type="number" min="5" max="40" step="5" value="${hvatambaPercent}" style="--coded-input-size:${String(hvatambaPercent).length}ch" data-sheet-input="hvatambaPercent" inputmode="numeric" aria-label="Размер скидки в процентах"><span>%</span></span><button type="button" data-sheet-clear="hvatambaPercent" aria-label="Сбросить размер скидки"><img src="assets/sheets/close.svg" alt=""></button></label><div class="codedChoices">${choiceButtons([5, 10, 20, 30, 40], hvatambaPercent, '%', 'hvatambaPercent')}</div></div></div><footer class="codedSheetFooter">${sheetProductSnippet(price, true)}<button class="primary" data-action="apply-sheet">Готово</button></footer></div>`
    };
  }
  if (name === 'delivery') {
    const deliveryAmount = sheetValue('deliveryAmount');
    return {
      title: 'Скидка на доставку',
      height: 762,
      body: `<div class="codedSheet" data-coded-sheet="delivery"><div class="codedSheetMain"><img class="codedHero" src="assets/sheets/delivery-hero.png" width="375" height="185" alt=""><div class="codedSheetCopy"><h3>Скидка на доставку</h3><p>Чем выше скидка, тем дешевле доставка<br>для покупателя</p><h4>Выберите сумму</h4><label class="codedInput"><span class="codedInputValue"><input type="number" min="50" max="1500" step="50" value="${deliveryAmount}" style="--coded-input-size:${String(deliveryAmount).length}ch" data-sheet-input="deliveryAmount" inputmode="numeric" aria-label="Скидка на доставку в рублях"><span>₽</span></span><button type="button" data-sheet-clear="deliveryAmount" aria-label="Сбросить скидку на доставку"><img src="assets/sheets/close.svg" alt=""></button></label><div class="codedRange"><input type="range" min="50" max="1500" step="50" value="${deliveryAmount}" data-sheet-input="deliveryAmount" aria-label="Скидка на доставку от 50 до 1500 рублей"><span>50</span><span>1 500</span></div><div class="codedHint"><strong>Оптимально — 200 ₽.</strong> Для 50% покупателей<br>доставка будет бесплатной, остальным скидка.</div></div></div><footer class="codedSheetFooter">${sheetProductSnippet(currentPrice(), state.hvatamba)}<button class="primary" data-action="apply-sheet">Готово</button></footer></div>`
    };
  }
  if (name === 'quantity') {
    const quantityPercent = sheetValue('quantityPercent');
    const quantityCount = sheetValue('quantityCount');
    const quantityScope = sheetValue('quantityScope');
    return {
      title: 'Скидка за количество',
      height: 762,
      body: `<div class="codedSheet" data-coded-sheet="quantity"><div class="codedSheetMain"><img class="codedHero" src="assets/sheets/quantity-hero.png" width="375" height="185" alt=""><div class="codedSheetCopy"><h3>Скидка за количество</h3><h4>Размер скидки</h4><div class="codedChoices">${choiceButtons([5, 10, 15, 20, 30], quantityPercent, '%', 'quantityPercent')}</div><h4>При заказе от</h4><div class="codedChoices codedChoicesScrollable">${choiceButtons([2, 3, 5, 8, 10], quantityCount, ' товаров', 'quantityCount')}</div><h4>Будет применяться</h4><p>Скидка действует при покупке нескольких<br>товаров. Выберите товары для акции</p><div class="scopeChoices"><button type="button" class="scopeChoice ${quantityScope === 'all' ? 'selected' : ''}" data-string-choice="quantityScope" data-value="all">На все товары</button><button type="button" class="scopeChoice ${quantityScope === 'selected' ? 'selected' : ''}" data-string-choice="quantityScope" data-value="selected">На некоторые <img src="assets/sheets/chevron.svg" alt=""></button></div></div></div><footer class="codedSheetFooter codedSheetFooterButtonOnly"><button class="primary" data-action="apply-sheet">Сохранить</button></footer></div>`
    };
  }
  if (name === 'promotion') {
    const promotionDays = sheetValue('promotionDays');
    const promotionBudget = sheetValue('promotionBudget');
    const budgets = [[123, 'promotion-balloon.png'], [200, 'promotion-plane.png'], [600, 'promotion-rocket.png']];
    return {
      title: 'Продвижение',
      height: 948,
      body: `<div class="codedSheet codedSheetScrollable" data-coded-sheet="promotion"><div class="codedSheetScroll"><div class="codedStickyTitle"><h3>Продвижение</h3></div><div class="codedSheetCopy promotionCopy"><p>Чем больше бюджет, тем чаще объявление<br>попадает в топ поиска и рекомендаций.</p><h4>Количество дней</h4><div class="codedChoices codedChoicesScrollable">${choiceButtons([1, 5, 7, 14, 30], promotionDays, '', 'promotionDays')}<button type="button" class="codedChoice">Другой срок</button></div><h4>Бюджет</h4><div class="budgetCards">${budgets.map(([value, image]) => `<button type="button" class="budgetCard ${promotionBudget === value ? 'selected' : ''}" data-sheet-choice="promotionBudget" data-value="${value}"><span><strong>${money(value)}</strong><small>Прирост просмотров</small><b>~42–333</b></span><img src="assets/sheets/${image}" alt=""></button>`).join('')}</div><button type="button" class="otherBudget">Другой бюджет</button></div></div><footer class="codedSheetFooter codedSheetFooterButtonOnly"><button class="primary" data-action="apply-sheet">Готово</button></footer></div>`
    };
  }
  if (name === 'methods') {
    const methodCard = (key, title, description, details) => `<article class="methodCard"><div><h4>${title}</h4><p>${description}</p></div><button type="button" class="codedToggle ${sheetValue(key) ? 'selected' : ''}" role="switch" aria-checked="${sheetValue(key)}" data-method-toggle="${key}" aria-label="${title}"><span></span></button><p class="methodDetails">${details}</p><button type="button" class="methodSetup">Настроить</button></article>`;
    return {
      title: 'Способы продажи',
      height: 862,
      body: `<div class="codedSheet codedSheetScrollable" data-coded-sheet="methods"><div class="codedSheetScroll"><div class="codedStickyTitle"><h3>Ваши данные</h3></div><div class="codedSheetCopy methodsCopy"><button type="button" class="dataRow"><span><strong>Зубовский бульвар., 11А</strong><small>Москва</small></span><img src="assets/sheets/chevron.svg" alt=""></button><button type="button" class="dataRow"><span><strong>+7 999 909 00 99</strong><small>Звонки и сообщения · Показ отключён</small></span><img src="assets/sheets/chevron.svg" alt=""></button><h3>Способы продажи</h3>${methodCard('pickup', 'Самовывоз', 'Заказ заберут по вашему адресу', 'Подготовка от 1 дня · Бронь 5 дней')} ${methodCard('saleDelivery', 'Доставка', 'Товар смогут заказать по всей России', 'Пункты выдачи, Курьер, Постаматы')}</div></div><footer class="codedSheetFooter codedSheetFooterButtonOnly"><button class="primary" data-action="apply-sheet">Готово</button></footer></div>`
    };
  }
  return null;
}
function updateSheetValue(field, rawValue) {
  const limits = {
    hvatambaPercent: [5, 40, 5],
    deliveryAmount: [50, 1500, 50],
    quantityPercent: [5, 30, 5],
    quantityCount: [2, 10, 1],
    promotionDays: [1, 30, 1],
    promotionBudget: [123, 600, 1]
  };
  const [minimum, maximum, step] = limits[field];
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) return;
  const target = sheetDraft || state;
  target[field] = Math.min(maximum, Math.max(minimum, Math.round(numericValue / step) * step));
}
function refreshCodedSheetControls(field) {
  const value = sheetValue(field);
  all(`[data-sheet-choice="${field}"]`).forEach(button => button.classList.toggle('selected', Number(button.dataset.value) === value));
  all(`[data-sheet-input="${field}"]`).forEach(input => {
    input.value = value;
    if (input.type === 'number') input.style.setProperty('--coded-input-size', `${String(value).length}ch`);
  });
  if (field === 'hvatambaPercent') {
    const price = $('.sheetProductPrice strong');
    if (price) price.textContent = money(basePrice * (1 - value / 100));
  }
}
function showCommissionTooltip(button) {
  clearTimeout(commissionTooltipTimer);
  const calculation = button.closest('.totalCalculation');
  if (!calculation) return;
  let tooltip = calculation.querySelector('.commissionTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'commissionTooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = 'Если товар купят с доставкой или самовывозом';
    calculation.append(tooltip);
  }
  requestAnimationFrame(() => tooltip.classList.add('shown'));
  commissionTooltipTimer = setTimeout(() => tooltip.classList.remove('shown'), 4000);
}
function openSheet(name) {
  if (recommendationSheet(name)) return;
  beginSheetDraft(name);
  const coded = codedSheet(name);
  if (coded) {
    sheet(coded.title, coded.body);
    $('.sheet').style.setProperty('--sheet-height', `${coded.height}px`);
    $('.sheet').classList.add('codedSheetShell', 'staticSheet', 'sheetCloseAlwaysVisible');
    return;
  }
  clearSheetDraft();
  if (name === 'benefits') return sheet('Больше поводов купить', `<p>Выберите преимущества объявления: участие в распродаже, скидку на доставку или на несколько товаров.</p><p>Бейджи над карточками показывают, что вы подключили. Пунктирные бейджи — ещё не подключённые преимущества.</p>${done}`);
  if (name === 'total') return sheet('Вы получите', `<div class="receipt"><span>Цена с текущей скидкой</span><strong>${money(currentPrice())}</strong><span>Скидка на доставку</span><strong>${state.delivery ? `до ${money(state.deliveryAmount)}` : 'Не подключена'}</strong><span>Вы получите</span><strong>${payoutText()}</strong></div><p>${state.delivery ? 'Скидка на доставку может потратиться частично или не потратиться. Первая сумма — если она не расходуется, вторая — если используется полностью.' : 'Скидка на доставку выключена, поэтому показываем одну сумму.'}</p>${done}`);
}
function summary() {
  const items = [state.hvatamba && `Хватамба — ${state.hvatambaPercent}% сейчас`, state.delivery && `Скидка на доставку — ${money(state.deliveryAmount)}`, state.quantity && `${state.quantityPercent}% от ${state.quantityCount} товаров`].filter(Boolean);
  for (const [key, label] of [['promotion', 'Продвижение'], ['xl', 'XL-объявление'], ['highlight', 'Выделение цены цветом']]) {
    if (state[key]) items.push(`${label} — 7 дней, ${money(100)}`);
  }
  items.push(`Привлекательность — ${attractivenessScore(state)}%`);
  sheet('Всё готово', `<img class="summaryPhoto" src="assets/product-sneakers-v98.png" alt="Кроссовки Nike"><h3>Кроссовки Nike</h3><div class="summaryPrice">${money(currentPrice())}</div><ul class="summaryList">${items.length ? items.map(item => `<li>${item}</li>`).join('') : '<li>Без дополнительных скидок</li>'}</ul><p class="muted">Предпросмотр настроек. Реальное объявление не изменено.</p><button class="primary" data-action="close">Вернуться к настройкам</button><button class="textButton" data-action="reset">Начать заново</button>`);
}
document.addEventListener('click', event => {
  const button = event.target.closest('button, [data-action]'); if (!button) return;
  if (button.dataset.commissionInfo !== undefined) return showCommissionTooltip(button);
  if (button.dataset.sheetChoice) {
    updateSheetValue(button.dataset.sheetChoice, button.dataset.value);
    refreshCodedSheetControls(button.dataset.sheetChoice);
    return;
  }
  if (button.dataset.sheetClear) {
    updateSheetValue(button.dataset.sheetClear, button.dataset.sheetClear === 'deliveryAmount' ? 200 : 10);
    refreshCodedSheetControls(button.dataset.sheetClear);
    return;
  }
  if (button.dataset.stringChoice) {
    const target = sheetDraft || state;
    target[button.dataset.stringChoice] = button.dataset.value;
    all(`[data-string-choice="${button.dataset.stringChoice}"]`).forEach(choice => choice.classList.toggle('selected', choice === button));
    return;
  }
  if (button.dataset.methodToggle) {
    const key = button.dataset.methodToggle;
    const target = sheetDraft || state;
    target[key] = !target[key];
    button.classList.toggle('selected', target[key]);
    button.setAttribute('aria-checked', String(target[key]));
    return;
  }
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
    case 'apply-sheet': return applySheetDraft();
    case 'close': return closeSheet();
    case 'complete':
      if (paidServicesTotal(state) > 0 && !state.paidServicesPaid) return window.startPaymentFlow?.(paidServicesTotal(state));
      return summary();
    case 'reset': {
      const deliveryPreEnabled = state.deliveryPreEnabled;
      state = { ...defaults, delivery: deliveryPreEnabled, deliveryPreEnabled };
      photoFiles.clear();
      try { localStorage.removeItem('promo-stream-selection-v1'); } catch {}
      closeSheet();
      render();
      $('#scroll').scrollTo({ top: 0, behavior: 'smooth' });
      all('.recommendationCarousel').forEach(carousel => carousel.scrollTo({ left: 0 }));
      return;
    }
    case 'save-exit': return toast('Изменения сохранены');
    case 'back': if ($('#scroll').scrollTop > 0) $('#scroll').scrollTo({ top: 0, behavior: 'smooth' }); else sheet('Вернуться назад?', `<p>Вы можете продолжить настройку или начать выбор скидок заново.</p><button class="primary" data-action="close">Остаться</button><button class="textButton" data-action="reset">Начать заново</button>`);
  }
});
document.addEventListener('input', event => {
  const input = event.target.closest('[data-sheet-input]');
  if (!input) return;
  updateSheetValue(input.dataset.sheetInput, input.value);
  refreshCodedSheetControls(input.dataset.sheetInput);
});
document.addEventListener('change', event => {
  const input = event.target.closest('[data-sheet-input]');
  if (!input) return;
  updateSheetValue(input.dataset.sheetInput, input.value);
  refreshCodedSheetControls(input.dataset.sheetInput);
});
document.addEventListener('keydown', event => {
  if ($('#overlay').hidden) return;
  if (event.key === 'Escape') closeSheet();
  if (event.key === 'Tab') {
    const controls = [...$('.sheet').querySelectorAll('button, input, select')].filter(control => !control.closest('[inert]'));
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
  const compact = scrollTop >= 80;
  $('#header').classList.toggle('headerScrolled', scrollTop > 0);
  $('#screen').classList.toggle('headerIsScrolled', scrollTop > 0);
  $('#header').classList.toggle('headerCompact', compact); $('#screen').classList.toggle('headerIsCompact', compact); $('.compactWrap').setAttribute('aria-hidden', String(!compact)); $('.compactWrap').inert = !compact;
}, { passive: true });
$('.compactWrap').inert = true;
document.addEventListener('promo:scenario-selected', event => {
  const deliveryPreEnabled = event.detail?.scenario === 'free-d-plus';
  state = { ...defaults, delivery: deliveryPreEnabled, deliveryPreEnabled };
  render();
});
render();

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const tool = {
    name: 'configure_promo_selection',
    title: 'Выбрать акции прототипа',
    description: 'Изменяет только переключатели в демо. Не сохраняет и не меняет реальное объявление.',
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
