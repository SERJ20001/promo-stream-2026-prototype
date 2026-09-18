const introSteps = [
  ['Выберите раздел объявления', 812],
  ['Фотографии товара', 812],
  ['Название объявления', 812],
  ['Категория товара', 812],
  ['Параметры и описание', 1693],
  ['Цена товара', 812],
  ['Способ продажи', 812],
  ['Автопубликация', 812],
  ['Продвижение объявления', 1007],
  ['Заметный вид объявления', 812],
  ['Подтверждение оплаты', 812],
  ['Оплата услуг Авито', 812],
  ['Оплата специальных услуг', 812],
  ['Успешная оплата', 812],
  ['Комиссия Авито Доставки', 812]
];
const intro = document.createElement('section');
intro.className = 'introFlow';
intro.tabIndex = -1;
intro.setAttribute('aria-label', 'Создание объявления');
document.querySelector('#app').append(intro);
let introIndex = 0;
let publicationTimer;
let paymentFlow = false;
let paymentAmount = 0;
const introAsset = index => {
  const versions = { 3: '-v51', 6: '-v49', 13: '-v50', 14: '-v51' };
  return `assets/intro/flow-${index}${versions[index] || ''}.png`;
};
const introOrder = [0, 1, 2, 3, 4, 5, 6, 14];
const paymentOrder = [10, 11, 12, 13];
function saleMethodScreen() {
  const toggle = '<span class="introSaleToggle" aria-hidden="true"><i></i></span>';
  return `<div class="introSaleMethodContent"><div class="introSaleLead"><h2>Способ продажи</h2><p>Укажите, где находится товар и как его<br>смогут получить</p></div><section class="introAddressCard"><div class="introAddressValue"><span>Москва, Зубовский бульвар., 11А</span><img src="assets/sheets/chevron.svg" alt=""></div><div class="introAddressDetails"><img src="assets/intro/address-details-v98.png" alt=""><span>Теперь можно добавить<br>детали в адреса</span><button type="button" tabindex="-1">Настроить</button></div></section><section class="introSaleCard"><h3>Самовывоз</h3>${toggle}<p>Покупатель приедет по вашему адресу</p><div class="introSaleFacts"><span>Подготовка<small>от 1 дня</small></span><span>Бронь товара<small>5 дней</small></span></div><button type="button" tabindex="-1">Настроить</button><img class="introSaleArt introPickupArt" src="assets/intro/pickup-illustration-v98.png" alt=""></section><section class="introSaleCard"><h3>Доставка</h3>${toggle}<p>Товар смогут заказать из других регионов</p><div class="introSaleDeliveryCopy"><span>Доставят партнёры Авито</span><small>В пункт выдачи, постамат, курьером</small></div><button type="button" tabindex="-1">Настроить</button><img class="introSaleArt introDeliveryArt" src="assets/intro/delivery-illustration-v98.png" alt=""></section></div>`;
}
function introPrefill(index, height) {
  const field = (x, y, width, blockHeight, content, className = '') => `<div class="introPrefill ${className}" style="left:${x / 375 * 100}%;top:${y / height * 100}%;width:${width / 375 * 100}%;height:${blockHeight / height * 100}%">${content}</div>`;
  const input = (x, y, width, blockHeight, text, className = '') => field(x, y, width, blockHeight, `<span>${text}</span>`, `introInputPatch ${className}`);
  if (index === 1) return field(16, 172, 208, 208, '<img src="assets/product-sneakers-v98.png" alt="Кроссовки Nike">', 'introPhotoPatch');
  if (index === 2) return input(16, 117, 343, 52, 'Кроссовки Nike');
  if (index === 5) return input(16, 101, 343, 52, '5 000 ₽');
  if (index === 10) return field(306, 180, 54, 28, money(paymentAmount), 'introPaymentTotalPatch');
  if (index === 11) return field(16, 67, 128, 40, money(paymentAmount), 'introPaymentAmountPatch');
  if (index === 14) return field(300, 386, 60, 24, '−150 ₽', 'introCommissionAmountPatch')
    + field(286, 432, 74, 24, '4 850 ₽', 'introCommissionPayoutPatch');
  if (index === 4) return input(16, 369, 343, 52, 'Отличное')
    + input(16, 477, 343, 52, '42')
    + input(16, 611, 343, 52, 'Nike')
    + field(16, 750, 343, 44, 'Укажите цвет, материал и другие подробности — это поможет покупателям.', 'introCopyPatch')
    + field(16, 920, 343, 60, 'Используйте меньше эмодзи и не пишите большими буквами: многих это отталкивает.', 'introCopyPatch')
    + field(72, 1166, 287, 52, 'Улучшить описание', 'introDescriptionButtonPatch');
  if (index === 6) return field(0, 0, 375, 740, saleMethodScreen(), 'introSaleMethodPatch');
  return '';
}
function showIntro(index) {
  clearTimeout(publicationTimer);
  document.querySelector('#screen').inert = false;
  document.querySelector('#screen').getAnimations({ subtree: true }).forEach(effect => effect.cancel());
  document.querySelector('#header').classList.remove('headerCompact');
  document.dispatchEvent(new Event('promo:confetti-stop'));
  document.querySelector('.publicationCelebration')?.remove();
  document.querySelector('.publicationCard')?.remove();
  intro.inert = false;
  introIndex = index;
  const [title, height] = introSteps[index];
  document.querySelector('#screen').hidden = true;
  intro.hidden = false;
  intro.dataset.step = String(index);
  const contentHeight = [812, 680, 311, 680, 1540, 680, 740, 680, 920, 680, 680, 680, 812, 680, 680][index];
  const imageHeader = index >= 10 && index <= 13;
  const header = index ? imageHeader
    ? `<header class="introFixedHeader introImageHeader"><img src="${introAsset(index)}" alt=""></header>`
    : '<header class="introFixedHeader"><nav class="nav"><button class="back introBack" aria-label="Назад"><img src="assets/icon-back.png" alt=""></button></nav></header>' : '';
  const footerLabels = { 7: 'Разместить объявление', 9: 'Перейти к оплате', 10: 'Оплатить', 11: 'Оплатить с кошелька', 13: 'Вернуться к публикации' };
  const footerLabel = footerLabels[index] || 'Продолжить';
  const hasFooter = index > 0 && index !== 12;
  const footer = hasFooter ? `<footer class="introFixedFooter"><button class="introNext introFixedNext" aria-label="${footerLabel}">${footerLabels[index] ? `<span>${footerLabel}</span>` : '<img src="assets/continue-button.png" alt="Продолжить">'}</button></footer>` : '';
  const loadingSpinner = index === 12 ? '<span class="paymentSpinner" aria-hidden="true"><img src="assets/loading-spinner.png" alt=""></span>' : '';
  intro.innerHTML = `${header}<div class="introViewport"><div class="introCrop" style="aspect-ratio:375 / ${contentHeight}"><div class="introCanvas"><img src="${introAsset(index)}" width="375" height="${height}" alt="${title}. Предзаполненный демонстрационный экран." draggable="false">${introPrefill(index, height)}${loadingSpinner}${index === 0 ? '<button class="introHit introNext" aria-label="Вещи, электроника, хобби, животные" style="top:49.4%;height:8.6%;"></button>' : ''}</div></div></div>${footer}`;
  if (index === 14) {
    const cover = document.createElement('div');
    cover.className = 'publicationSourceCover';
    intro.querySelector('.introCanvas').append(cover);
    const card = document.createElement('div');
    card.className = 'publicationCard publicationCardInitial';
    card.innerHTML = '<img src="assets/product-sneakers-v98.png" alt="Кроссовки Nike"><div><strong>5 000 ₽</strong><span>Кроссовки Nike</span><span class="publicationDetails">Новое, 42 размер</span></div>';
    document.querySelector('#app').append(card);
  }
  intro.scrollTop = 0;
  intro.querySelector('.introViewport').scrollTop = 0;
  intro.focus({ preventScroll: true });
  if (index === 12) publicationTimer = setTimeout(() => showIntro(13), 6000);
  const activeOrder = paymentFlow ? paymentOrder : introOrder;
  const nextIndex = activeOrder[activeOrder.indexOf(index) + 1];
  if (nextIndex !== undefined) {
    const next = new Image();
    next.src = introAsset(nextIndex);
  }
}
function showPublicationCelebration() {
  intro.inert = true;
  const celebration = document.createElement('section');
  celebration.className = 'publicationCelebration';
  celebration.setAttribute('aria-label', 'Объявление опубликовано');
  celebration.innerHTML = '<div class="publicationNav"><button class="back introHit publicationBack" aria-label="Назад"><img src="assets/icon-back.png" alt=""></button></div>';
  document.querySelector('#app').append(celebration);
  celebration.querySelector('.publicationBack').addEventListener('click', () => showIntro(14));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const card = document.querySelector('.publicationCard');
  const photo = card.querySelector('img');
  const expansion = { duration: reduced ? 0 : 720, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'forwards' };
  celebration.animate([{ backgroundColor: '#ffffff00' }, { backgroundColor: '#fff' }], { duration: reduced ? 0 : 240, fill: 'forwards' });
  card.animate([
    { top: '269px', left: '10px', width: 'calc(100% - 20px)', height: '103px', padding: '12px', borderRadius: '28px', transform: 'rotate(0deg)' },
    { top: '45.58%', left: '20px', width: 'calc(100% - 40px)', height: '130px', padding: '12px', borderRadius: '28px', transform: 'rotate(1deg)' }
  ], expansion);
  photo.animate([{ width: '80px', height: '80px', borderRadius: '16px' }, { width: '106px', height: '106px', borderRadius: '20px' }], expansion);
  card.querySelector('strong').animate([
    { transform: 'scale(0.888888889)', lineHeight: '22.5px', height: '20px' },
    { transform: 'scale(1)', lineHeight: '22px', height: '22px' }
  ], expansion);
  card.querySelector('strong + span').animate([{ marginTop: '1px' }, { marginTop: '2px' }], expansion);
  document.dispatchEvent(new Event('promo:confetti'));
  publicationTimer = setTimeout(showRecommendationsAfterPublication, reduced ? 800 : 3000);
}
intro.addEventListener('click', event => {
  const activeOrder = paymentFlow ? paymentOrder : introOrder;
  if (event.target.closest('.introBack')) {
    const position = activeOrder.indexOf(introIndex);
    if (paymentFlow && position === 0) return showRecommendations();
    const previousIndex = activeOrder[Math.max(0, position - 1)];
    return showIntro(previousIndex);
  }
  if (!event.target.closest('.introNext')) return;
  if (introIndex === 14) return showPublicationCelebration();
  if (paymentFlow && introIndex === 13) {
    state.paidServicesPaid = true;
    render();
    return showRecommendations();
  }
  if (activeOrder.indexOf(introIndex) + 1 < activeOrder.length) {
    const nextIndex = activeOrder[activeOrder.indexOf(introIndex) + 1];
    return showIntro(nextIndex);
  }
  showRecommendations();
});
document.querySelector('.back').addEventListener('click', event => {
  if (document.querySelector('#scroll').scrollTop > 0) return;
  event.stopPropagation();
  paymentFlow = false;
  showIntro(14);
});
function showRecommendations(keepTransition = false) {
  clearTimeout(publicationTimer);
  paymentFlow = false;
  document.dispatchEvent(new Event('promo:confetti-stop'));
  document.querySelector('.publicationCelebration')?.remove();
  document.querySelector('.publicationCard')?.remove();
  if (!keepTransition) document.querySelector('.publicationTransition')?.remove();
  intro.hidden = true;
  intro.inert = true;
  const screen = document.querySelector('#screen');
  screen.hidden = false;
  screen.inert = false;
  screen.classList.remove('headerIsScrolled', 'headerIsCompact');
  document.querySelector('#scroll').scrollTop = 0;
  document.querySelector('#header').classList.remove('headerScrolled', 'headerCompact');
}
async function showRecommendationsAfterPublication() {
  if (!document.querySelector('.publicationCard') || !document.querySelector('.publicationCelebration')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  intro.inert = true;
  const transition = document.createElement('div');
  transition.className = 'publicationTransition';
  transition.setAttribute('aria-hidden', 'true');
  document.querySelector('#app').append(transition);
  const cover = transition.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: reduced ? 0 : 260, easing: 'ease-in', fill: 'forwards' }
  );
  await cover.finished.catch(() => {});
  showRecommendations(true);
  document.querySelector('#screen').inert = true;
  const reveal = transition.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: reduced ? 0 : 340, easing: 'ease-out', fill: 'forwards' }
  );
  await reveal.finished.catch(() => {});
  transition.remove();
  document.querySelector('#screen').inert = false;
}
window.startPaymentFlow = amount => {
  if (!document.querySelector('#overlay').hidden) closeSheet();
  paymentAmount = amount;
  paymentFlow = true;
  showIntro(10);
};
intro.hidden = true;
document.querySelector('#screen').hidden = true;
document.addEventListener('promo:viewer-start', () => {
  const search = new URLSearchParams(location.search);
  const requestedScreen = search.get('screen');
  const requestedSheet = search.get('sheet');
  const qaMode = search.get('qa') === '1';
  if (qaMode && (requestedScreen === 'recommendations' || requestedSheet)) {
    showRecommendations();
    if (requestedSheet) openSheet(requestedSheet);
    return;
  }
  showIntro(0);
}, { once: true });
