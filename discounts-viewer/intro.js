const introSteps = [
  ['Выберите раздел объявления', 812],
  ['Фотографии товара', 812],
  ['Название объявления', 812],
  ['Категория товара', 812],
  ['Параметры и описание', 1693],
  ['Цена товара', 812],
  ['Адрес и способы продажи', 812],
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
let introTransitioning = false;
const introAsset = index => {
  const versions = { 3: '-v51', 6: '-v49', 8: '-v61', 10: '-v61', 13: '-v50', 14: '-v51' };
  return `assets/intro/flow-${index}${versions[index] || ''}.png`;
};
const introOrder = [0, 1, 2, 3, 4, 5, 6, 14, 8, 9, 10, 11, 12, 13];
function introPrefill(index, height) {
  const field = (x, y, width, blockHeight, content, className = '') => `<div class="introPrefill ${className}" style="left:${x / 375 * 100}%;top:${y / height * 100}%;width:${width / 375 * 100}%;height:${blockHeight / height * 100}%">${content}</div>`;
  const input = (x, y, width, blockHeight, text, className = '') => field(x, y, width, blockHeight, `<span>${text}</span>`, `introInputPatch ${className}`);
  if (index === 1) return field(16, 172, 208, 208, '<img src="assets/product-boots.png" alt="Ботинки Hermes">', 'introPhotoPatch');
  if (index === 2) return input(16, 117, 343, 52, 'Ботинки Hermes');
  if (index === 5) return input(16, 101, 343, 52, '5 000 ₽');
  if (index === 11) return field(16, 67, 128, 40, '339 ₽', 'introPaymentAmountPatch');
  if (index === 12) return field(75, 430, 225, 52, 'Оплата 339 ₽', 'introPaymentStatusPatch');
  if (index === 14) return field(300, 386, 60, 24, '−150 ₽', 'introCommissionAmountPatch')
    + field(286, 432, 74, 24, '4 850 ₽', 'introCommissionPayoutPatch');
  if (index === 4) return input(16, 369, 343, 52, 'Новое')
    + input(16, 477, 343, 52, '44')
    + input(16, 611, 343, 52, 'Hermes')
    + field(16, 750, 343, 44, 'Можно добавить — так у покупателей будет меньше вопросов', 'introCopyPatch')
    + field(16, 920, 343, 60, 'Старайтесь использовать меньше эмодзи и не пишите большими буквами: многих это отталкивает.', 'introCopyPatch')
    + input(16, 1000, 343, 158, 'Ботинки Hermes, коричневая кожа. Новые, размер 44. Без дефектов.', 'introTextareaPatch');
  return '';
}
function showIntro(index) {
  clearTimeout(publicationTimer);
  const screen = document.querySelector('#screen');
  screen.inert = true;
  screen.getAnimations({ subtree: true }).forEach(effect => effect.cancel());
  document.querySelector('.product').style.visibility = '';
  document.querySelector('.product').style.opacity = '';
  document.querySelector('#screen .title').style.visibility = '';
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
  const contentHeight = [812, 680, 311, 680, 1540, 680, 738, 680, 955, 680, 680, 680, 812, 680, 680][index];
  const imageHeader = index >= 10 && index <= 13;
  const header = index ? imageHeader
    ? `<header class="introFixedHeader introImageHeader"><img src="${introAsset(index)}" alt=""><button class="introHit introBack" aria-label="Назад"></button></header>`
    : '<header class="introFixedHeader"><nav class="nav"><button class="back introBack" aria-label="Назад"><img src="assets/icon-back.png" alt=""></button><span class="save">Сохранить и выйти</span></nav></header>'
    : '<button class="introHit introExit" aria-label="Назад к выбору режима"></button>';
  const footerLabels = { 7: 'Разместить объявление', 9: 'Перейти к оплате', 10: 'Оплатить', 11: 'Оплатить с кошелька', 13: 'Вернуться к публикации' };
  const footerLabel = footerLabels[index] || 'Продолжить';
  const hasFooter = index > 0 && index !== 12;
  const footer = hasFooter ? `<footer class="introFixedFooter"><button class="introNext introFixedNext" aria-label="${footerLabel}">${footerLabels[index] ? `<span>${footerLabel}</span>` : '<img src="assets/continue-button.png" alt="Продолжить">'}</button></footer>` : '';
  const loadingSpinner = index === 12 ? '<span class="paymentSpinner" aria-hidden="true"><img src="assets/loading-spinner.png" alt=""></span>' : '';
  intro.innerHTML = `${header}<div class="introViewport"><div class="introCrop" style="aspect-ratio:375 / ${contentHeight - (index ? 52 : 0)}"><div class="introCanvas"><img src="${introAsset(index)}" width="375" height="${height}" alt="${title}. Предзаполненный демонстрационный экран." draggable="false">${introPrefill(index, height)}${loadingSpinner}${index === 0 ? '<button class="introHit introNext" aria-label="Вещи, электроника, хобби, животные" style="top:49.4%;height:8.6%;"></button>' : ''}</div></div></div>${footer}`;
  const viewport = intro.querySelector('.introViewport');
  viewport.addEventListener('scroll', () => {
    const limit = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const clamped = Math.min(limit, Math.max(0, viewport.scrollTop));
    if (clamped !== viewport.scrollTop) viewport.scrollTop = clamped;
  }, { passive: true });
  if (index === 14) {
    const cover = document.createElement('div');
    cover.className = 'publicationSourceCover';
    intro.querySelector('.introCanvas').append(cover);
    const card = document.createElement('div');
    card.className = 'publicationCard publicationCardInitial';
    card.innerHTML = '<img src="assets/product-boots.png" alt="Ботинки Hermes"><div><strong>5 000 ₽</strong><span>Ботинки Hermes</span><span class="publicationDetails">Новое, 44 размер</span></div>';
    document.querySelector('#app').append(card);
  }
  intro.scrollTop = 0;
  viewport.scrollTop = 0;
  intro.focus({ preventScroll: true });
  if (index === 12) publicationTimer = setTimeout(() => transitionToIntro(13), 6000);
  if (index + 1 < introSteps.length) {
    const next = new Image();
    next.src = introAsset(introOrder[introOrder.indexOf(index) + 1] ?? 13);
  }
}
function showPublicationCelebration() {
  intro.inert = true;
  const celebration = document.createElement('section');
  celebration.className = 'publicationCelebration';
  celebration.setAttribute('aria-label', 'Объявление опубликовано');
  celebration.innerHTML = `<div class="publicationNav"><img src="${introAsset(14)}" alt=""><button class="introHit publicationBack" aria-label="Назад"></button></div>`;
  document.querySelector('#app').append(celebration);
  celebration.querySelector('.publicationBack').addEventListener('click', () => transitionFromPublication(14, 140, 220));
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
  publicationTimer = setTimeout(showPromotionAfterPublication, reduced ? 800 : 3000);
}
async function transitionToIntro(index) {
  if (introTransitioning) return;
  introTransitioning = true;
  intro.inert = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const outgoing = intro.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: reduced ? 0 : 140, easing: 'ease-out', fill: 'forwards' }
  );
  await outgoing.finished.catch(() => {});
  intro.style.opacity = '0';
  outgoing.cancel();
  showIntro(index);
  intro.inert = true;
  const incoming = intro.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: reduced ? 0 : 240, easing: 'ease-in', fill: 'forwards' }
  );
  await incoming.finished.catch(() => {});
  incoming.cancel();
  intro.style.opacity = '';
  intro.inert = false;
  introTransitioning = false;
}
intro.addEventListener('click', event => {
  if (introTransitioning) return;
  if (event.target.closest('.introExit')) {
    document.dispatchEvent(new Event('promo:viewer-back'));
    return;
  }
  if (event.target.closest('.introBack')) {
    const previousIndex = introOrder[Math.max(0, introOrder.indexOf(introIndex) - 1)];
    return transitionToIntro(previousIndex);
  }
  if (!event.target.closest('.introNext')) return;
  if (introIndex === 14) return showPublicationCelebration();
  if (introOrder.indexOf(introIndex) + 1 < introOrder.length) {
    const nextIndex = introOrder[introOrder.indexOf(introIndex) + 1];
    return transitionToIntro(nextIndex);
  }
  transitionToDiscounts();
});
document.querySelector('.back').addEventListener('click', event => {
  event.stopPropagation();
  transitionFromDiscounts(13);
});
async function transitionFromPublication(index, coverDuration, revealDuration) {
  if (!document.querySelector('.publicationCard') || !document.querySelector('.publicationCelebration')) return;
  if (introTransitioning) return;
  introTransitioning = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  intro.inert = true;
  const transition = document.createElement('div');
  transition.className = 'publicationTransition';
  transition.setAttribute('aria-hidden', 'true');
  document.querySelector('#app').append(transition);
  const cover = transition.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: reduced ? 0 : coverDuration, easing: 'ease-in', fill: 'forwards' }
  );
  await cover.finished.catch(() => {});
  showIntro(index);
  intro.inert = true;
  const reveal = transition.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: reduced ? 0 : revealDuration, easing: 'ease-out', fill: 'forwards' }
  );
  await reveal.finished.catch(() => {});
  transition.remove();
  intro.inert = false;
  introTransitioning = false;
}
function showPromotionAfterPublication() {
  transitionFromPublication(8, 260, 340);
}
async function transitionToDiscounts() {
  if (introTransitioning) return;
  introTransitioning = true;
  intro.inert = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const outgoing = intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 0 : 140, easing: 'ease-out', fill: 'forwards' });
  await outgoing.finished.catch(() => {});
  outgoing.cancel();
  intro.hidden = true;
  const screen = document.querySelector('#screen');
  screen.hidden = false;
  screen.inert = true;
  document.querySelector('#scroll').scrollTop = 0;
  const incoming = screen.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 0 : 240, easing: 'ease-in', fill: 'forwards' });
  await incoming.finished.catch(() => {});
  incoming.cancel();
  screen.inert = false;
  document.querySelector('.back').focus({ preventScroll: true });
  introTransitioning = false;
}
async function transitionFromDiscounts(index) {
  if (introTransitioning) return;
  introTransitioning = true;
  const screen = document.querySelector('#screen');
  screen.inert = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const outgoing = screen.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 0 : 140, easing: 'ease-out', fill: 'forwards' });
  await outgoing.finished.catch(() => {});
  outgoing.cancel();
  showIntro(index);
  intro.inert = true;
  const incoming = intro.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 0 : 240, easing: 'ease-in', fill: 'forwards' });
  await incoming.finished.catch(() => {});
  incoming.cancel();
  intro.inert = false;
  introTransitioning = false;
}
intro.hidden = true;
document.querySelector('#screen').hidden = true;
document.addEventListener('promo:viewer-start', () => showIntro(0));
