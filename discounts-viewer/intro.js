const introSteps = [
  ['Выберите раздел объявления', 812],
  ['Фотографии товара', 812],
  ['Название объявления', 812],
  ['Категория товара', 812],
  ['Параметры и описание', 1693],
  ['Цена товара', 812],
  ['Контакты и способы продажи', 1027],
  ['Автопубликация', 812],
  ['Продвижение объявления', 1007],
  ['Заметный вид объявления', 812]
];
const intro = document.createElement('section');
intro.className = 'introFlow';
intro.tabIndex = -1;
intro.setAttribute('aria-label', 'Создание объявления');
document.querySelector('#app').append(intro);
let introIndex = 0;
let publicationTimer;
let publicationRun = 0;
let publicationBadges;
const introOrder = [0, 1, 2, 3, 4, 5, 6, 8, 9, 7];
function restorePublicationBadges() {
  if (!publicationBadges) return;
  const { node, parent, style } = publicationBadges;
  node.getAnimations().forEach(effect => effect.cancel());
  node.classList.remove('publicationBadges');
  if (style === null) node.removeAttribute('style');
  else node.setAttribute('style', style);
  parent.append(node);
  publicationBadges = undefined;
}
function introPrefill(index, height) {
  const field = (x, y, width, blockHeight, content, className = '') => `<div class="introPrefill ${className}" style="left:${x / 375 * 100}%;top:${y / height * 100}%;width:${width / 375 * 100}%;height:${blockHeight / height * 100}%">${content}</div>`;
  const input = (x, y, width, blockHeight, text, className = '') => field(x, y, width, blockHeight, `<span>${text}</span>`, `introInputPatch ${className}`);
  if (index === 1) return field(16, 172, 208, 208, '<img src="assets/product-boots.png" alt="Ботинки Hermes">', 'introPhotoPatch');
  if (index === 2) return input(16, 117, 343, 52, 'Ботинки Hermes');
  if (index === 9) return field(296, 179, 46, 26, '<img src="assets/toggle-off.png" alt="XL-объявление выключено">', 'introTogglePatch') + field(296, 381, 46, 26, '<img src="assets/toggle-off.png" alt="Выделение цены выключено">', 'introTogglePatch');
  if (index === 5) return input(16, 101, 343, 52, '5 000 ₽');
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
  publicationRun += 1;
  restorePublicationBadges();
  document.querySelector('#screen').inert = false;
  document.querySelector('#screen').getAnimations({ subtree: true }).forEach(effect => effect.cancel());
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
  const contentHeight = [812, 680, 311, 680, 1540, 680, 875, 680, 920, 610][index];
  const header = index ? '<header class="introFixedHeader"><nav class="nav"><button class="back introBack" aria-label="Назад"><img src="assets/icon-back.png" alt=""></button><span class="save">Сохранить и выйти</span></nav></header>' : '';
  const footer = index ? `<footer class="introFixedFooter">${index === 6 ? '<div class="introPayout"><span>Вы получите за товар</span><strong>5 000 ₽</strong></div>' : ''}<button class="introNext introFixedNext" aria-label="${index === 7 ? 'Разместить объявление' : 'Продолжить'}">${index === 7 ? '<span>Разместить объявление</span>' : '<img src="assets/continue-button.png" alt="Продолжить">'}</button>${index === 8 ? '<button class="introNext introSecondary">Продолжить без продвижения</button>' : ''}</footer>` : '';
  intro.innerHTML = `${header}<div class="introViewport"><div class="introCrop" style="aspect-ratio:375 / ${contentHeight - (index ? 52 : 0)}"><div class="introCanvas"><img src="assets/intro/flow-${index}.png" width="375" height="${height}" alt="${title}. Предзаполненный демонстрационный экран." draggable="false">${introPrefill(index, height)}${index === 0 ? '<button class="introHit introNext" aria-label="Вещи, электроника, хобби, животные" style="top:49.4%;height:8.6%;"></button>' : ''}</div></div></div>${footer}`;
  if (index === 7) {
    const cover = document.createElement('div');
    cover.className = 'publicationSourceCover';
    intro.querySelector('.introCanvas').append(cover);
    const card = document.createElement('div');
    card.className = 'publicationCard publicationCardInitial';
    card.innerHTML = '<img src="assets/product-boots.png" alt="Ботинки Hermes"><div><strong>5 000 ₽</strong><span>Ботинки Hermes</span><span class="publicationDetails">Новое, 44 размер</span></div>';
    document.querySelector('#app').append(card);
  }
  intro.scrollTop = 0;
  intro.querySelector('.introViewport').scrollTop = 0;
  intro.focus({ preventScroll: true });
  if (index + 1 < introSteps.length) {
    const next = new Image();
    next.src = `assets/intro/flow-${introOrder[introOrder.indexOf(index) + 1] ?? 7}.png`;
  }
}
function showPublicationCelebration() {
  intro.inert = true;
  const celebration = document.createElement('section');
  celebration.className = 'publicationCelebration';
  celebration.setAttribute('aria-label', 'Объявление почти готово');
  celebration.innerHTML = `<div class="publicationNav"><img src="assets/intro/flow-7.png" alt=""><button class="introHit publicationBack" aria-label="Назад"></button></div>`;
  document.querySelector('#app').append(celebration);
  celebration.querySelector('.publicationBack').addEventListener('click', () => showIntro(7));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const card = document.querySelector('.publicationCard');
  const photo = card.querySelector('img');
  const expansion = { duration: reduced ? 0 : 720, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'forwards' };
  celebration.animate([{ backgroundColor: '#ffffff00' }, { backgroundColor: '#fff' }], { duration: reduced ? 0 : 240, fill: 'forwards' });
  card.animate([
    { top: '110px', left: '12px', width: 'calc(100% - 24px)', height: '66px', padding: '9px', borderRadius: '20px', transform: 'rotate(0deg)' },
    { top: '45.58%', left: '20px', width: 'calc(100% - 40px)', height: '130px', padding: '12px', borderRadius: '28px', transform: 'rotate(1deg)' }
  ], expansion);
  photo.animate([{ width: '48px', height: '48px', borderRadius: '12px' }, { width: '106px', height: '106px', borderRadius: '20px' }], expansion);
  card.querySelector('strong').animate([
    { transform: 'scale(0.888888889)', lineHeight: '22.5px', height: '20px' },
    { transform: 'scale(1)', lineHeight: '22px', height: '22px' }
  ], expansion);
  card.querySelector('strong + span').animate([{ marginTop: '1px' }, { marginTop: '2px' }], expansion);
  card.querySelector('.publicationDetails').animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 0 : 400, delay: reduced ? 0 : 220, fill: 'both' });
  document.dispatchEvent(new Event('promo:confetti'));
  publicationTimer = setTimeout(showPublicationRecommendations, reduced ? 800 : 3000);
}
intro.addEventListener('click', event => {
  if (event.target.closest('.introBack')) return showIntro(introOrder[Math.max(0, introOrder.indexOf(introIndex) - 1)]);
  if (!event.target.closest('.introNext')) return;
  if (introIndex === 7) return showPublicationCelebration();
  if (introOrder.indexOf(introIndex) + 1 < introOrder.length) return showIntro(introOrder[introOrder.indexOf(introIndex) + 1]);
  intro.hidden = true;
  document.querySelector('#screen').hidden = false;
  document.querySelector('#scroll').scrollTop = 0;
  document.querySelector('.back').focus({ preventScroll: true });
});
document.querySelector('.back').addEventListener('click', event => {
  if (document.querySelector('#scroll').scrollTop > 0) return;
  event.stopPropagation();
  showIntro(7);
});
async function showPublicationRecommendations() {
  const run = publicationRun;
  const screen = document.querySelector('#screen');
  const card = document.querySelector('.publicationCard');
  const celebration = document.querySelector('.publicationCelebration');
  if (!card || !celebration) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const options = { duration: reduced ? 0 : 720, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'forwards' };
  intro.hidden = true;
  celebration.querySelector('.publicationNav').hidden = true;
  screen.hidden = false;
  screen.inert = true;
  document.querySelector('#scroll').scrollTop = 0;
  const target = document.querySelector('.product');
  target.style.opacity = '0';
  const targetTitle = screen.querySelector('.title');
  targetTitle.style.visibility = 'hidden';
  const appBounds = prototypeBounds(document.querySelector('#app'));
  const titleBounds = prototypeBounds(targetTitle);
  const movingTitle = document.querySelector('.confettiTitle');
  const titleStyle = getComputedStyle(movingTitle);
  const titleFrom = Object.fromEntries(['top', 'left', 'width', 'height', 'transform'].map(key => [key, titleStyle[key]]));
  const bounds = prototypeBounds(target);
  const photoBounds = prototypeBounds(target.querySelector('img'));
  const start = getComputedStyle(card);
  const end = getComputedStyle(target);
  const from = Object.fromEntries(['top', 'left', 'width', 'height', 'padding', 'borderRadius', 'transform', 'gap'].map(key => [key, start[key]]));
  const badges = target.querySelector('.badges');
  const badgeBounds = prototypeBounds(badges);
  publicationBadges = { node: badges, parent: badges.parentElement, style: badges.getAttribute('style') };
  badges.classList.add('publicationBadges');
  badges.style.width = `${badgeBounds.width}px`;
  badges.style.right = `${bounds.right - badgeBounds.right}px`;
  badges.style.bottom = `${bounds.bottom - badgeBounds.bottom}px`;
  card.append(badges);
  badges.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduced ? 0 : 220, delay: reduced ? 0 : 500, easing: 'ease-out', fill: 'both'
  });
  card.getAnimations().forEach(effect => effect.cancel());
  movingTitle.getAnimations().forEach(effect => effect.cancel());
  movingTitle.animate([
    { ...titleFrom, right: 'auto', opacity: 1 },
    { top: `${titleBounds.top - appBounds.top}px`, left: `${titleBounds.left - appBounds.left}px`, width: `${titleBounds.width}px`, height: `${titleBounds.height}px`, right: 'auto', transform: 'rotate(0deg)', opacity: 1 }
  ], options);
  movingTitle.animate([
    { '--title-reveal': '-15%' }, { '--title-reveal': '-15%', offset: .16 },
    { '--title-reveal': '100%', offset: .76 }, { '--title-reveal': '100%' }
  ], options);
  celebration.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 0 : 360, fill: 'forwards' });
  document.querySelectorAll('#screen .visibility, #screen .options, #screen .footer').forEach(node => node.animate([{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'translateY(0)' }], { ...options, duration: reduced ? 0 : 570, delay: reduced ? 0 : 150, fill: 'both' }));
  const motion = card.animate([from, { top: `${bounds.top - appBounds.top}px`, left: `${bounds.left - appBounds.left}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, padding: end.padding, borderRadius: end.borderRadius, gap: end.gap, transform: 'rotate(0deg)' }], options);
  card.querySelector('img').animate([{ width: '106px', height: '106px' }, { width: `${photoBounds.width}px`, height: `${photoBounds.height}px`, borderRadius: '18px' }], options);
  const textInfo = card.querySelector('strong').parentElement;
  textInfo.animate([
    { paddingTop: getComputedStyle(textInfo).paddingTop },
    { paddingTop: getComputedStyle(target.querySelector('.productInfo')).paddingTop }
  ], options);
  card.querySelector('.publicationDetails').animate([{ opacity: 1 }, { opacity: 0 }], { ...options, duration: reduced ? 0 : 200 });
  await motion.finished.catch(() => {});
  if (run !== publicationRun) return;
  restorePublicationBadges();
  const originalPhoto = card.querySelector('img');
  originalPhoto.getAnimations().forEach(effect => effect.cancel());
  target.querySelector('img').replaceWith(originalPhoto);
  card.getAnimations({ subtree: true }).forEach(effect => effect.cancel());
  card.className = 'product';
  card.replaceChildren(...target.childNodes);
  target.replaceWith(card);
  celebration.remove();
  targetTitle.style.visibility = '';
  document.dispatchEvent(new Event('promo:confetti-stop'));
  screen.inert = false;
}

function prototypeBounds(element) {
  const app = document.querySelector('#app');
  const scale = app.getBoundingClientRect().width / app.offsetWidth;
  const bounds = element.getBoundingClientRect();
  return Object.fromEntries(['top', 'left', 'right', 'bottom', 'width', 'height'].map(key => [key, bounds[key] / scale]));
}
intro.hidden = true;
document.querySelector('#screen').hidden = true;
document.addEventListener('promo:viewer-start', () => showIntro(0), { once: true });
