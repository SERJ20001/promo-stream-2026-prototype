const recommendationCards = {
  promotion: [
    { title: 'Поднятие в поиске', icon: '1000-57649', toggle: 'promotion', description: 'Прирост просмотров ~42–333.<br>Лимит 35 контактов', button: '7 дней · 100 ₽', sheet: 'promotion' },
    { title: 'Большой размер объявления', icon: '1000-57661', toggle: 'xl', description: 'Большая карточка в результатах поиска по сравнению с конкурентами', button: '7 дней · 100 ₽' },
    { title: 'Выделение цены цветом', icon: '1000-57673', toggle: 'highlight', description: 'Привлечёт внимание к цене объявления. Ваше конкурентное преимущество', button: '7 дней · 100 ₽' }
  ],
  discounts: [
    { title: 'Хватамба', icon: '1000-57689', toggle: 'hvatamba', description: 'Покажем красную скидку и старую цену<br>12 авг – 20 сен · ещё 7 дней', button: 'Скидка <span data-percent="hvatamba">20</span>%', sheet: 'hvatamba', price: 'hvatambaPrice' },
    { title: 'Скидка на доставку', icon: '1000-57711', toggle: 'delivery', description: 'До 2,5 раз больше шансов на продажу. Привлеките покупателей из регионов', button: '<span id="deliveryValue">350 ₽</span>', sheet: 'delivery' },
    { title: 'Скидка за количество', icon: '1000-57723', toggle: 'quantity', description: 'Выгодно купить сразу несколько товаров. Увеличивает средний чек', button: '<span id="quantityValue">10% от 3 товаров</span>', sheet: 'quantity' },
  ],
  content: [
    { title: 'Загрузите ещё 5 фото', icon: '1000-57736', description: 'Они помогают больше узнать о товаре<br>и повысить доверие', upload: 'photo' },
    { title: 'Добавьте короткое видео', icon: '1000-57748', description: 'Оно помогает больше узнать о товаре<br>и повысить доверие', upload: 'video' },
    { title: 'Способы связи', icon: '1000-57760', toggle: 'contacts', description: 'Сейчас вам можно только написать.<br>Многим это не подходит', button: 'Звонки и сообщения', sheet: 'methods' }
  ]
};

document.querySelectorAll('[data-card-group]').forEach(group => {
  group.innerHTML = recommendationCards[group.dataset.cardGroup].map(card => {
    const toggle = card.toggle ? `<button class="toggle" role="switch" aria-checked="false" aria-label="${card.title}" data-toggle="${card.toggle}"><img src="assets/toggle-off.png" alt=""></button>` : '';
    const button = card.upload
      ? `<label class="pill uploadButton"><span data-${card.upload}-action>Загрузить</span><span aria-hidden="true">+</span><input id="${card.upload}Upload" type="file" accept="${card.upload === 'photo' ? 'image/*' : 'video/*'}" ${card.upload === 'photo' ? 'multiple' : ''} aria-label="${card.title}"></label>`
      : card.sheet
        ? `<button class="pill" data-sheet="${card.sheet}">${card.button}<img class="chevron" src="assets/icon-chevron.png" alt=""></button>`
        : `<span class="pill fixedPill">${card.button}</span>`;
    return `<article class="recommendationCard"><div class="cardHeading"><img src="assets/alternative/${card.icon}.png" alt=""><strong>${card.title}</strong>${toggle}</div><p class="description">${card.description}</p>${button}${card.price ? `<span id="${card.price}" hidden></span>` : ''}</article>`;
  }).join('');
});

document.querySelectorAll('[data-product-preview]').forEach(preview => {
  preview.innerHTML = `<div class="scorePhoto"><object class="scoreVector" data="assets/recommendations/score-outline.svg" type="image/svg+xml" tabindex="-1" aria-hidden="true"></object><img class="scoreProduct" src="assets/product-boots.png" alt="Ботинки Hermes"><object class="scoreHeart" data="assets/recommendations/score-heart.svg" type="image/svg+xml" tabindex="-1" aria-hidden="true"></object></div><div class="productInfo"><div class="price"><strong data-price>5 000 ₽</strong><del data-old aria-label="5 000 ₽"><img class="oldPriceImage" src="assets/old-price-header.png" alt="5 000 ₽"></del></div>${preview.dataset.productPreview === 'full' ? '<div class="productName">Ботинки Hermes</div><div class="productCondition">Новое, 44 размер</div>' : ''}<button class="scoreButton" data-sheet="attractiveness">Привлекательность <span data-score>0%</span></button></div>`;
});

const photoFiles = new Map();

function withSvg(object, callback) {
  const apply = () => {
    const svg = object.contentDocument?.documentElement;
    if (svg) callback(svg);
  };
  object.addEventListener('load', apply, { once: true });
  apply();
}

function renderScoreVector(object, percent, color) {
  withSvg(object, svg => {
    const base = svg.querySelector('rect');
    if (!base) return;
    base.setAttribute('fill', 'none');
    base.setAttribute('stroke', '#e6e6e6');
    base.setAttribute('stroke-linecap', 'round');
    let progress = svg.querySelector('[data-score-progress]');
    if (!progress) {
      progress = base.cloneNode();
      progress.dataset.scoreProgress = '';
      progress.style.transition = reducedMotion.matches ? 'none' : 'stroke-dasharray 450ms ease, stroke 450ms ease';
      svg.append(progress);
    }
    const length = progress.getTotalLength();
    progress.setAttribute('stroke', color);
    progress.setAttribute('stroke-dasharray', `${length * percent / 100} ${length}`);
    progress.setAttribute('stroke-dashoffset', String(-length * 0.6));
    object.style.opacity = '1';
  });
}

function renderScoreHeart(object, color) {
  withSvg(object, svg => {
    const heart = svg.querySelector('path');
    if (!heart) return;
    heart.setAttribute('fill', color);
    object.style.opacity = '1';
  });
}

function renderRecommendations() {
  const score = attractivenessScore(state);
  const colors = attractivenessColors(score);
  document.querySelectorAll('[data-product-preview]').forEach(node => { node.style.setProperty('--score-color', colors.text); node.style.setProperty('--score-ring-color', colors.ring); });
  document.querySelectorAll('[data-score]').forEach(node => { node.textContent = `${score}%`; });
  document.querySelectorAll('.scoreVector').forEach(object => renderScoreVector(object, score, colors.ring));
  document.querySelectorAll('.scoreHeart').forEach(object => renderScoreHeart(object, colors.ring));
  document.querySelectorAll('.scoreButton').forEach(button => button.setAttribute('aria-label', `Привлекательность ${score}%. Как рассчитывается показатель`));
  document.querySelectorAll('[data-payment]').forEach(node => { node.textContent = money(paidServicesTotal(state)); });
  const hasPaidServices = paidServicesTotal(state) > 0;
  document.querySelector('[data-services-row]').hidden = !hasPaidServices;
  document.querySelector('[data-services-label]').textContent = 'Платные услуги';
  document.querySelector('.recommendationTotals').disabled = false;
  document.querySelector('.totalDetails').hidden = false;
  document.querySelector('.recommendationFooter').classList.toggle('withoutPaidServices', !hasPaidServices);
  const needsPayment = hasPaidServices && !state.paidServicesPaid;
  document.querySelector('.continueButton').textContent = needsPayment ? `Оплатить ${money(paidServicesTotal(state))}` : 'Готово';
  document.querySelector('[data-photo-action]').textContent = state.photos ? 'Фото добавлены' : 'Загрузить';
  document.querySelector('[data-video-action]').textContent = state.video ? 'Видео добавлено' : 'Загрузить';
  document.querySelectorAll('[data-toggle]').forEach(button => {
    button.closest('.recommendationCard')?.classList.toggle('recommendationEnabled', state[button.dataset.toggle]);
  });
}

function recommendationSheet(name) {
  if (name === 'attractiveness') {
    sheet('Как мы оцениваем привлекательность?', '<div class="figmaSheetCanvas attractivenessSheetCanvas"><img class="figmaSheetImage" src="assets/recommendations/sheet-attractiveness-v42.png" width="375" height="953" alt="Как мы оцениваем привлекательность: позиция товара, выгода на товар, контент и условия"></div>');
    document.querySelector('.sheet').classList.add('figmaSheet', 'staticSheet', 'scoreSheet');
    document.querySelector('.sheet').scrollTop = 0;
    return true;
  }
  if (name === 'total') {
    const serviceRows = [];
    for (const [key, label] of [['promotion', 'Продвижение на 7 дней'], ['xl', 'Большой размер объявления'], ['highlight', 'Выделение цены цветом']]) {
      if (state[key]) serviceRows.push([label, money(100)]);
    }
    const payment = paidServicesTotal(state);
    const adjustmentRows = [
      hasPayoutAdjustments() && ['Комиссия 3%', money(commissionAmount()), 'commission'],
      state.hvatamba && ['Скидка в распродаже', money(saleDiscountAmount())],
      state.delivery && ['Скидка на доставку', money(state.deliveryAmount)]
    ].filter(Boolean);
    const sheetHeight = Math.min(516, 336 + (adjustmentRows.length + serviceRows.length) * 30);
    const rows = (items, extraClass = '') => items.map(([label, value, type]) => `<div class="totalCalculationRow ${extraClass}"><span>${label}${type === 'commission' ? '<img src="assets/question-outline.svg" alt="">' : ''}</span><i></i><strong>${value}</strong></div>`).join('');
    const needsPayment = payment > 0 && !state.paidServicesPaid;
    const services = serviceRows.length ? `<section class="totalCalculationServices"><strong class="totalCalculationHeading">Специальные услуги</strong>${rows(serviceRows)}<div class="totalCalculationRow totalCalculationPayment"><span>Заплатить сейчас</span><i></i><strong>${money(payment)}</strong></div></section>` : '';
    sheet('Итого', `<div class="totalCalculation" style="height:${sheetHeight}px"><strong class="totalCalculationTitle">Итого</strong><section class="totalCalculationReceipt"><div class="totalCalculationRow totalCalculationPrice"><span>Ваша цена</span><i></i><strong>${money(basePrice)}</strong></div>${rows(adjustmentRows)}<div class="totalCalculationRow totalCalculationResult"><span>Получите за товар<br>когда его купят</span><i></i><strong>${payoutText()}</strong></div></section>${services}<button class="totalSheetButton" data-action="${needsPayment ? 'complete' : 'close'}">${needsPayment ? `Оплатить ${money(payment)}` : 'Готово'}</button></div>`);
    document.querySelector('.sheet').classList.add('figmaSheet', 'staticSheet', 'totalCalculationSheet', 'sheetCloseAlwaysVisible');
    document.querySelector('.sheet').style.setProperty('--total-sheet-height', `${sheetHeight}px`);
    document.querySelector('.sheet').scrollTop = 0;
    return true;
  }
  return false;
}

document.querySelector('#photoUpload').addEventListener('change', event => {
  for (const file of event.target.files) {
    if (file.type.startsWith('image/')) photoFiles.set(`${file.name}:${file.size}:${file.lastModified}`, file);
  }
  if (!photoFiles.size) return;
  state.photos = photoFiles.size >= 5;
  render();
  toast(state.photos ? 'Фотографии добавлены' : `Добавлено ${photoFiles.size} из 5 фотографий`);
  event.target.value = '';
});

document.querySelector('#videoUpload').addEventListener('change', event => {
  if (![...event.target.files].some(file => file.type.startsWith('video/'))) return;
  state.video = true;
  render();
  toast('Видео добавлено');
  event.target.value = '';
});

document.querySelectorAll('.recommendationCarousel').forEach(carousel => {
  carousel.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const step = carousel.querySelector('.recommendationCard').getBoundingClientRect().width + 11;
    carousel.scrollBy({ left: step * (event.key === 'ArrowRight' ? 1 : -1), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
});
