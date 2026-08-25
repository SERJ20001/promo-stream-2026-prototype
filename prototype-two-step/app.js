const state = {
  screen: "start",
  promotion: true,
  xl: true,
  color: true,
  promotionDays: 7,
  promotionBudget: 100,
  delivery: true,
  deliveryAmount: 100,
  productDiscount: true,
  productPercent: 10,
  activeSheet: null,
  toastTimer: null
};

const elements = {
  device: document.querySelector("[data-device]"),
  screens: [...document.querySelectorAll("[data-screen]")],
  stepOneScroll: document.querySelector("[data-step-one-scroll]"),
  stepOneFooter: document.querySelector("[data-step-one-footer]"),
  stepOneSummary: document.querySelector("[data-step-one-summary]"),
  stepOneTotal: document.querySelector("[data-step-one-total]"),
  stepOneScore: document.querySelector("[data-step-one-score]"),
  stepOneBars: document.querySelector("[data-step-one-bars]"),
  dayChips: document.querySelector("[data-day-chips]"),
  budgetCarousel: document.querySelector("[data-budget-carousel]"),
  deliveryChips: document.querySelector("[data-delivery-chips]"),
  productDiscountChips: document.querySelector("[data-product-discount-chips]"),
  currentPrice: document.querySelector("[data-current-price]"),
  oldPrice: document.querySelector("[data-old-price]"),
  stepTwoScore: document.querySelector("[data-step-two-score]"),
  stepTwoBars: document.querySelector("[data-step-two-bars]"),
  discountCount: document.querySelector("[data-discount-count]"),
  discountTotal: document.querySelector("[data-discount-total]"),
  benefitCount: document.querySelector("[data-benefit-count]"),
  benefitTotal: document.querySelector("[data-benefit-total]"),
  backdrop: document.querySelector("[data-backdrop]"),
  sheets: [...document.querySelectorAll("[data-sheet]")],
  stepOneLines: document.querySelector("[data-step-one-lines]"),
  finalBenefitLines: document.querySelector("[data-final-benefit-lines]"),
  finalDiscounts: document.querySelector("[data-final-discounts]"),
  finalDiscountLines: document.querySelector("[data-final-discount-lines]"),
  payTotal: document.querySelector("[data-pay-total]"),
  payButtonTotal: document.querySelector("[data-pay-button-total]"),
  payout: document.querySelector("[data-payout]"),
  toast: document.querySelector("[data-toast]")
};

const promotionBudgets = [
  {
    value: 100,
    reach: "+89–100",
    description: "Совет нейросети,<br>скорость продажи<br>больше до x1,5",
    art: "promo-balloon.png"
  },
  {
    value: 200,
    reach: "+120–330",
    description: "Скорость<br>продажи до x2",
    art: "promo-plane.png"
  },
  {
    value: 300,
    reach: "+280–550",
    description: "Скорость<br>продажи до x3",
    art: "promo-rocket.png"
  }
];

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(value).replace(/\u00a0/g, " ");
}

function pluralize(value, one, few, many) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function getBenefits() {
  return [
    state.promotion && { id: "promotion", label: `Продвижение на ${state.promotionDays} дней`, price: state.promotionBudget },
    state.xl && { id: "xl", label: "XL размер объявления", price: 100 },
    state.color && { id: "color", label: "Выделение цены цветом", price: 100 }
  ].filter(Boolean);
}

function getDiscounts() {
  const productAmount = state.productDiscount ? 5000 * state.productPercent / 100 : 0;
  const deliveryAmount = state.delivery ? state.deliveryAmount : 0;

  return {
    count: Number(state.delivery) + Number(state.productDiscount),
    currentPrice: 5000 - productAmount,
    deliveryAmount,
    productAmount,
    total: productAmount + deliveryAmount
  };
}

function createChip(value, suffix, onClick, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = `${value}${suffix}`;
  button.dataset.value = String(value);
  button.dataset.debugLabel = `${value}${suffix}`;
  button.addEventListener("click", onClick);
  return button;
}

function initializeControls() {
  elements.dayChips.replaceChildren(...[7, 14, 30].map((value) => createChip(
    value,
    " дней",
    () => {
      state.promotionDays = value;
      render();
    },
    "day-chip"
  )));

  elements.budgetCarousel.replaceChildren(...promotionBudgets.map((budget) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "budget-card";
    button.dataset.value = String(budget.value);
    button.dataset.debugLabel = `${budget.value} ₽`;
    button.innerHTML = `<strong>${budget.reach}<img class="budget-visibility" src="../assets/two-step/visibility.svg" alt=""></strong><img class="budget-check" src="../assets/two-step/check-default.svg" alt=""><span>${budget.description}</span><small>${budget.value} ₽</small><img class="budget-art" src="../assets/two-step/${budget.art}" alt="">`;
    button.addEventListener("click", () => {
      state.promotionBudget = budget.value;
      render();
    });
    return button;
  }));
  elements.deliveryChips.replaceChildren(...[100, 200, 300].map((value) => createChip(
    value,
    " ₽",
    () => {
      state.deliveryAmount = value;
      render();
    },
    "discount-chip"
  )));

  elements.productDiscountChips.replaceChildren(...[10, 15, 20].map((value) => createChip(
    value,
    "%",
    () => {
      state.productPercent = value;
      render();
    },
    "discount-chip"
  )));
}

function updateChipSelection(container, selectedValue, enabled = true) {
  [...container.children].forEach((button) => {
    const isSelected = enabled && Number(button.dataset.value) === selectedValue;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    button.disabled = !enabled;
  });
}

function renderPromotionControls() {
  updateChipSelection(elements.dayChips, state.promotionDays);
  [...elements.budgetCarousel.children].forEach((button) => {
    const isSelected = Number(button.dataset.value) === state.promotionBudget;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    const check = button.querySelector(".budget-check");
    const checkName = isSelected ? "check-selected.svg" : "check-default.svg";
    const checkSource = `../assets/two-step/${checkName}`;
    if (check.getAttribute("src") !== checkSource) check.setAttribute("src", checkSource);
  });
}

function renderStepOne() {
  const benefits = getBenefits();
  const count = benefits.length;
  const total = benefits.reduce((sum, benefit) => sum + benefit.price, 0);

  elements.stepOneScroll.classList.toggle("is-promotion-off", !state.promotion);
  elements.stepOneFooter.classList.toggle("is-empty", count === 0);
  elements.stepOneSummary.textContent = count === 1
    ? benefits[0].label
    : `${count} ${pluralize(count, "преимущество", "преимущества", "преимуществ")}`;
  elements.stepOneTotal.textContent = `${formatNumber(total)} ₽`;
  const barLevel = count === 0 ? 0 : Math.min(count + 1, 3);
  elements.stepOneBars.className = `score-bars level-${barLevel}`;

  const scoreLabels = ["Заметность низкая", "Заметность высокая", "Заметность высокая", "Заметность максимальная"];
  elements.stepOneScore.textContent = scoreLabels[count];

  document.querySelectorAll("[data-toggle]").forEach((toggle) => {
    toggle.setAttribute("aria-checked", String(state[toggle.dataset.toggle]));
  });

  renderPromotionControls();
}

function renderDiscountControls() {
  updateChipSelection(elements.deliveryChips, state.deliveryAmount, state.delivery);
  updateChipSelection(elements.productDiscountChips, state.productPercent, state.productDiscount);
}

function renderStepTwo() {
  const discounts = getDiscounts();
  const benefits = getBenefits();
  const benefitsTotal = benefits.reduce((sum, benefit) => sum + benefit.price, 0);

  elements.currentPrice.textContent = `${formatNumber(discounts.currentPrice)} ₽`;
  elements.oldPrice.hidden = !state.productDiscount;
  elements.discountCount.textContent = `${discounts.count} ${pluralize(discounts.count, "скидка", "скидки", "скидок")}`;
  elements.discountTotal.textContent = `${state.delivery ? "до " : ""}${formatNumber(discounts.total)} ₽`;
  elements.benefitCount.textContent = `${benefits.length} ${pluralize(benefits.length, "преимущество", "преимущества", "преимуществ")}`;
  elements.benefitTotal.textContent = `${formatNumber(benefitsTotal)} ₽`;
  elements.payout.textContent = `от ${formatNumber(discounts.currentPrice - discounts.deliveryAmount)} ₽`;

  const scoreLabels = ["Низкая выгода", "Средняя выгода", "Заметная выгода"];
  elements.stepTwoScore.textContent = scoreLabels[discounts.count];
  elements.stepTwoBars.className = `score-bars benefit-bars level-${discounts.count}`;

  renderDiscountControls();
}

function createLine(label, price) {
  const line = document.createElement("div");
  line.className = "sheet-line";
  line.innerHTML = `<span>${label}</span><i></i><span>${formatNumber(price)} ₽</span>`;
  return line;
}

function createDiscountLine(label, price, upTo = false) {
  const line = document.createElement("div");
  line.className = "sheet-line";
  line.innerHTML = `<span>${label}</span><i></i><span><s>${upTo ? "до " : ""}${formatNumber(price)} ₽</s><b>0 ₽</b></span>`;
  return line;
}

function renderSheets() {
  const benefits = getBenefits();
  const discounts = getDiscounts();
  const total = benefits.reduce((sum, benefit) => sum + benefit.price, 0);
  const lines = benefits.map((benefit) => createLine(benefit.label, benefit.price));
  const discountLines = [
    state.productDiscount && createDiscountLine("Скидка на товар", discounts.productAmount),
    state.delivery && createDiscountLine("Скидка на доставку", discounts.deliveryAmount, true)
  ].filter(Boolean);
  elements.stepOneLines.replaceChildren(...lines.map((line) => line.cloneNode(true)));
  elements.finalBenefitLines.replaceChildren(...lines);
  elements.finalDiscountLines.replaceChildren(...discountLines);
  elements.finalDiscounts.hidden = discountLines.length === 0;
  elements.payTotal.textContent = `${formatNumber(total)} ₽`;
  elements.payButtonTotal.textContent = `${formatNumber(total)} ₽`;
}

function render() {
  renderStepOne();
  renderStepTwo();
  renderSheets();
}

function showScreen(name) {
  closeSheet();
  state.screen = name;
  elements.screens.forEach((screen) => {
    const isActive = screen.dataset.screen === name;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });
  const activeScroll = document.querySelector(`[data-screen="${name}"] .step-scroll`);
  if (activeScroll) activeScroll.scrollTop = 0;
}

function openSheet(name) {
  state.activeSheet = name;
  elements.backdrop.classList.add("is-visible");
  elements.sheets.forEach((sheet) => {
    const isOpen = sheet.dataset.sheet === name;
    sheet.classList.toggle("is-open", isOpen);
    sheet.setAttribute("aria-hidden", String(!isOpen));
  });
}

function closeSheet() {
  state.activeSheet = null;
  elements.backdrop.classList.remove("is-visible");
  elements.sheets.forEach((sheet) => {
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
  });
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

function syncViewport() {
  const viewport = window.visualViewport;
  const width = viewport ? viewport.width : window.innerWidth;
  const height = viewport ? viewport.height : window.innerHeight;
  const scale = Math.min(width / 375, height / 812, 1);
  elements.device.style.transform = `scale(${scale})`;
  document.body.style.paddingTop = `${viewport ? viewport.offsetTop : 0}px`;
}

function guardVerticalScroll(container) {
  let lastX = 0;
  let lastY = 0;

  container.addEventListener("touchstart", (event) => {
    lastX = event.touches[0].clientX;
    lastY = event.touches[0].clientY;
  }, { passive: true });

  container.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    const deltaX = touch.clientX - lastX;
    const deltaY = touch.clientY - lastY;
    lastX = touch.clientX;
    lastY = touch.clientY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) return;

    const atTop = container.scrollTop <= 0;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
    if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) event.preventDefault();
  }, { passive: false });
}

document.querySelector("[data-start]").addEventListener("click", () => showScreen("step-one"));
document.querySelector("[data-next-step]").addEventListener("click", () => showScreen("step-two"));
document.querySelector("[data-open-step-one-summary]").addEventListener("click", () => openSheet("step-one-summary"));
document.querySelector("[data-sheet-next]").addEventListener("click", () => showScreen("step-two"));
document.querySelector("[data-open-final-summary]").addEventListener("click", () => openSheet("final-summary"));
document.querySelector("[data-finish]").addEventListener("click", () => showToast("Настройки сохранены — продолжаем публикацию"));
document.querySelector("[data-pay]").addEventListener("click", () => {
  closeSheet();
  showToast("Переходим к оплате преимуществ");
});

document.querySelectorAll("[data-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    state[toggle.dataset.toggle] = !state[toggle.dataset.toggle];
    render();
  });
});

document.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
elements.backdrop.addEventListener("click", closeSheet);

if (new URLSearchParams(window.location.search).has("debug")) {
  elements.device.classList.add("is-debug");
}

window.addEventListener("resize", syncViewport);
window.visualViewport?.addEventListener("resize", syncViewport);
window.visualViewport?.addEventListener("scroll", syncViewport);

document.querySelectorAll(".step-scroll").forEach(guardVerticalScroll);

initializeControls();
render();
syncViewport();
