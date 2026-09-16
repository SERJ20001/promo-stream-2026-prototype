const recommendationCards = {
  promotion: [
    { title: 'Продвижение', icon: '1000-57649', toggle: 'promotion', description: 'Прирост просмотров ~42–333.<br>Лимит 35 контактов', button: '7 дней · 100 ₽', sheet: 'promotion' },
    { title: 'Большой размер объявления', icon: '1000-57661', toggle: 'xl', description: 'Большая карточка в результатах поиска по сравнению с конкурентами', button: '7 дней · 100 ₽' },
    { title: 'Выделение цены цветом', icon: '1000-57673', toggle: 'highlight', description: 'Привлечёт внимание к цене объявления. Ваше конкурентное преимущество', button: '7 дней · 100 ₽' }
  ],
  discounts: [
    { title: 'Хватамба', icon: '1000-57689', toggle: 'hvatamba', description: 'Покажем красную скидку и старую цену<br>12 авг – 20 сен · ещё 7 дней', button: 'Скидка <span data-percent="hvatamba">20</span>%', sheet: 'hvatamba', price: 'hvatambaPrice' },
    { title: 'Скидка на доставку', icon: '1000-57711', toggle: 'delivery', description: 'До 2,5 раз больше шансов на продажу. Привлеките покупателей из регионов', button: '<span id="deliveryValue">350 ₽</span>', sheet: 'delivery' },
    { title: 'Скидка за количество', icon: '1000-57723', toggle: 'quantity', description: 'Выгодно купить сразу несколько товаров. Увеличивает средний чек', button: '<span id="quantityValue">10% от 3 товаров</span>', sheet: 'quantity' },
  ],
  content: [
    { title: 'Загрузите еще 5 фото', icon: '1000-57736', description: 'Они помогают больше узнать о товаре<br>и повысить доверие', upload: 'photo' },
    { title: 'Добавьте короткое видео', icon: '1000-57748', description: 'Они помогают больше узнать о товаре<br>и повысить доверие', upload: 'video' },
    { title: 'Способы связи', icon: '1000-57760', toggle: 'contacts', description: 'Сейчас вам можно только написать.<br>Многим это не подходит', button: 'Звонки и сообщения', sheet: 'methods' }
  ]
};

document.querySelectorAll('[data-card-group]').forEach(group => {
  group.innerHTML = recommendationCards[group.dataset.cardGroup].map(card => {
    const toggle = card.toggle ? `<button class="toggle" role="switch" aria-checked="false" aria-label="${card.title}" data-toggle="${card.toggle}"><span aria-hidden="true"></span></button>` : '';
    const button = card.upload
      ? `<label class="pill uploadButton"><span data-${card.upload}-action>Загрузить</span><span aria-hidden="true">+</span><input id="${card.upload}Upload" type="file" accept="${card.upload === 'photo' ? 'image/*' : 'video/*'}" ${card.upload === 'photo' ? 'multiple' : ''} aria-label="${card.title}"></label>`
      : card.sheet
        ? `<button class="pill" data-sheet="${card.sheet}">${card.button}<img class="chevron" src="assets/icon-chevron.png" alt=""></button>`
        : `<span class="pill fixedPill">${card.button}</span>`;
    const iconUrl = `assets/alternative/${card.icon}.png?v=3`;
    return `<article class="recommendationCard"><div class="cardHeading"><span class="cardIcon cardIcon-${card.icon}"><img src="${iconUrl}" width="28" height="28" alt=""></span><strong>${card.title}</strong>${toggle}</div><p class="description">${card.description}</p>${button}${card.price ? `<span id="${card.price}" hidden></span>` : ''}</article>`;
  }).join('');
});

const scoreHelpIcon = `<svg class="scoreHelpIcon" viewBox="0 0 12 16" aria-hidden="true" focusable="false"><path d="M6 10.7002C6.44064 10.7002 6.79785 11.0574 6.79785 11.498C6.79775 11.9386 6.44058 12.2959 6 12.2959C5.55942 12.2959 5.20225 11.9386 5.20215 11.498C5.20215 11.0574 5.55936 10.7002 6 10.7002Z" fill="currentColor"></path><path d="M6.00293 5.25C7.14794 5.25 8.07402 6.17962 8.07422 7.32422C8.07422 8.09217 7.65778 8.76296 7.04004 9.12109C6.73072 9.30036 6.55273 9.44141 6.55273 9.87793V10.0039H5.45312V9.87793C5.45312 9.12109 5.75108 8.59457 6.48828 8.16895C7.34603 7.67373 6.99219 6.34961 6.00293 6.34961C5.5473 6.34965 5.16242 6.66576 5.05859 7.09277L4.92871 7.62695L3.86035 7.36719L3.99023 6.83301C4.21076 5.92558 5.0268 5.25004 6.00293 5.25Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6 3C9.31371 3 12 5.68629 12 9C12 12.3137 9.31371 15 6 15C2.68629 15 0 12.3137 0 9C0 5.68629 2.68629 3 6 3ZM6 4.09961C3.2938 4.09961 1.09961 6.2938 1.09961 9C1.09961 11.7062 3.2938 13.9004 6 13.9004C8.70619 13.9004 10.9004 11.7062 10.9004 9C10.9004 6.2938 8.70619 4.09961 6 4.09961Z" fill="currentColor"></path></svg>`;

document.querySelectorAll('[data-product-preview]').forEach(preview => {
  preview.innerHTML = `<div class="scorePhoto"><svg class="attractivenessMeter" viewBox="0 0 100 100" aria-hidden="true"><path class="attractivenessTrack" d="M50 99.107 H19.643 A18.75 18.75 0 0 1 .893 80.357 V19.643 A18.75 18.75 0 0 1 19.643 .893 H80.357 A18.75 18.75 0 0 1 99.107 19.643 V80.357 A18.75 18.75 0 0 1 80.357 99.107 H50" pathLength="100"></path><path class="attractivenessProgress" d="M50 99.107 H19.643 A18.75 18.75 0 0 1 .893 80.357 V19.643 A18.75 18.75 0 0 1 19.643 .893 H80.357 A18.75 18.75 0 0 1 99.107 19.643 V80.357 A18.75 18.75 0 0 1 80.357 99.107 H50" pathLength="100"></path></svg><img class="scoreProduct" src="assets/product-boots.png" alt="Ботинки Hermes"><svg class="attractivenessHeart" viewBox="0 0 16 15" aria-hidden="true"><path d="M7.95703 1.78125C9.71224 0.583458 12.1231 0.764064 13.6797 2.32422H13.6807C15.44 4.08816 15.4391 6.94608 13.6797 8.70996L13.6807 8.71094L8.69629 13.7061C8.5088 13.8939 8.25467 13.9999 7.98926 14C7.72367 14 7.46885 13.8941 7.28125 13.7061L2.31836 8.73145C2.31199 8.72506 2.30695 8.71746 2.30078 8.71094C0.562482 6.95213 0.56717 4.11583 2.31543 2.36328L2.48242 2.20312C4.01629 0.813935 6.27588 0.673894 7.95703 1.78125Z"></path></svg></div><div class="productInfo"><div class="price"><strong data-price>5 000 ₽</strong><del data-old aria-label="5 000 ₽"><img class="oldPriceImage" src="assets/old-price-header.png" alt="5 000 ₽"></del></div>${preview.dataset.productPreview === 'full' ? '<div class="productName">Ботинки Hermes</div><div class="productCondition">Новое, 44 размер</div>' : ''}<button class="scoreButton" data-sheet="attractiveness">Привлекательность <span data-score>0%</span>${scoreHelpIcon}</button></div>`;
});

const photoFiles = new Map();
const attractivenessHeartAnimations = new WeakMap();
const attractivenessGrowthDuration = 900;

function stopAttractivenessHeartPulse(heart) {
  attractivenessHeartAnimations.get(heart)?.cancel();
  attractivenessHeartAnimations.delete(heart);
}

function pulseAttractivenessHeart(heart) {
  stopAttractivenessHeartPulse(heart);
  const animation = heart.animate([
    { transform: 'scale(1)', offset: 0 },
    { transform: 'scale(1.6)', offset: .45 },
    { transform: 'scale(.98)', offset: .74 },
    { transform: 'scale(1)', offset: 1 }
  ], {
    duration: attractivenessGrowthDuration,
    easing: 'cubic-bezier(.2,.8,.2,1)'
  });
  attractivenessHeartAnimations.set(heart, animation);
  animation.finished.finally(() => {
    if (attractivenessHeartAnimations.get(heart) === animation) attractivenessHeartAnimations.delete(heart);
  }).catch(() => {});
}

function renderAttractivenessMeter(meter, percent, color) {
  const progress = meter.querySelector('.attractivenessProgress');
  const heart = meter.parentElement.querySelector('.attractivenessHeart');
  const previousPercent = Number(meter.dataset.progress);
  const scoreIncreased = Number.isFinite(previousPercent) && percent > previousPercent;
  const transition = reducedMotion.matches ? 'none' : `stroke-dasharray ${attractivenessGrowthDuration}ms cubic-bezier(.25,.1,.25,1), stroke 450ms ease`;
  progress.style.transition = transition;
  progress.style.stroke = color;
  progress.style.strokeDasharray = `${percent} ${100 - percent}`;
  heart.style.transition = reducedMotion.matches ? 'none' : 'fill 450ms ease';
  heart.style.fill = color;
  meter.dataset.progress = String(percent);
  meter.style.opacity = '1';
  heart.style.opacity = '1';
  if (scoreIncreased && !reducedMotion.matches) pulseAttractivenessHeart(heart);
  else stopAttractivenessHeartPulse(heart);
}

function renderRecommendations() {
  const score = attractivenessScore(state);
  const colors = attractivenessColors(score);
  document.querySelectorAll('[data-product-preview]').forEach(node => { node.style.setProperty('--score-color', colors.text); node.style.setProperty('--score-ring-color', colors.ring); });
  document.querySelectorAll('[data-score]').forEach(node => { node.textContent = `${score}%`; });
  document.querySelectorAll('.attractivenessMeter').forEach(meter => renderAttractivenessMeter(meter, score, colors.ring));
  document.querySelectorAll('.scoreButton').forEach(button => button.setAttribute('aria-label', `Привлекательность ${score}%. Как рассчитывается показатель`));
  document.querySelectorAll('[data-payment]').forEach(node => { node.textContent = money(paidServicesTotal(state)); });
  const hasPaidServices = paidServicesTotal(state) > 0;
  const selectedServices = [state.promotion && 'Продвижение', state.xl && 'XL размер', state.highlight && 'Выделение цены цветом'].filter(Boolean);
  const servicesLabel = selectedServices.length > 2 ? `${selectedServices.slice(0, 2).join(', ')}, +${selectedServices.length - 2}` : selectedServices.join(', ');
  document.querySelector('[data-services-row]').hidden = !hasPaidServices;
  document.querySelector('[data-services-label]').textContent = servicesLabel;
  document.querySelector('[data-payout-label]').textContent = 'Вы получите за товар';
  document.querySelector('.recommendationTotals').disabled = false;
  document.querySelector('.totalDetails').hidden = false;
  document.querySelector('.recommendationFooter').classList.toggle('withoutPaidServices', !hasPaidServices);
  document.querySelector('#app').style.setProperty('--recommendation-footer-height', hasPaidServices ? '142px' : '114px');
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
    const body = '<div class="figmaSheetCanvas attractivenessSheetCanvas"><img class="figmaSheetImage" src="assets/recommendations/sheet-attractiveness-v42.png" width="1125" height="2859" alt="Как мы оцениваем привлекательность"></div>';
    sheet('Как мы оцениваем привлекательность?', body);
    document.querySelector('.sheet').classList.add('figmaSheet', 'staticSheet', 'scoreImageSheet');
    document.querySelector('.sheet').scrollTop = 0;
    return true;
  }
  if (name === 'total') {
    const serviceRows = [];
    for (const [key, label] of [['promotion', 'Продвижение на 7 дней'], ['xl', 'Большой размер объявления'], ['highlight', 'Выделение цены цветом']]) {
      if (state[key]) serviceRows.push([label, money(100)]);
    }
    const payment = paidServicesTotal(state);
    const discountRows = [
      state.hvatamba && ['Скидка в распродаже', money(saleDiscountAmount())],
      state.delivery && ['Скидка на доставку', money(state.deliveryAmount)]
    ].filter(Boolean);
    const adjustmentRows = [['Комиссия 3%', money(commissionAmount()), 'commission'], ...discountRows];
    const sheetHeight = Math.min(580, 278 + discountRows.length * 30 + (serviceRows.length ? 86 + serviceRows.length * 32 : 0));
    const rows = (items, extraClass = '') => items.map(([label, value, type]) => `<div class="totalCalculationRow ${extraClass}">${type === 'commission' ? `<button type="button" class="commissionInfo" data-commission-info aria-label="${label}. Подробнее о комиссии">${label}<img src="assets/question-outline.svg" alt=""></button>` : `<span>${label}</span>`}<i></i><strong>${value}</strong></div>`).join('');
    const needsPayment = payment > 0 && !state.paidServicesPaid;
    const services = serviceRows.length ? `<section class="totalCalculationServices"><strong class="totalCalculationHeading">Специальные услуги</strong>${rows(serviceRows)}<div class="totalCalculationRow totalCalculationPayment"><span>Заплатить сейчас</span><i></i><strong>${money(payment)}</strong></div></section>` : '';
    sheet('Итого', `<div class="totalCalculation" style="height:${sheetHeight}px"><strong class="totalCalculationTitle" aria-hidden="true">Итого</strong><div class="totalCalculationBody"><section class="totalCalculationReceipt"><div class="totalCalculationRow totalCalculationPrice"><span>Ваша цена</span><i></i><strong>${money(basePrice)}</strong></div>${rows(adjustmentRows)}<div class="totalCalculationRow totalCalculationResult"><span>Получите за товар<br>когда его купят</span><i></i><strong>${payoutText()}</strong></div></section>${services}</div><button class="totalSheetButton" data-action="${needsPayment ? 'complete' : 'close'}">${needsPayment ? `Оплатить ${money(payment)}` : 'Готово'}</button></div>`);
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
