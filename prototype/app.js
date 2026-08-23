const featureCatalog = [
  {
    id: "promote",
    group: "recommended",
    title: "Поднимем в поиске",
    description: "Ваш товар увидит больше людей<br>1–3 контакта · 18–84 просмотра",
    icon: "feature-promote.svg",
    parameter: () => `${state.promotionDays} дней`,
    price: "120 ₽",
    sheet: "promotion"
  },
  {
    id: "product",
    group: "recommended",
    title: "Скидка на товар",
    description: "Покупатели не уйдут к другим<br>продавцам",
    icon: "feature-product.svg",
    parameter: () => `${state.productPercent}% · На Хватамбе`,
    price: "Бесплатно",
    free: true,
    sheet: "product"
  },
  {
    id: "delivery",
    group: "recommended",
    title: "Скидка на доставку",
    description: "Сейчас ничего не платите. Вычтем<br>меньше если выйдет дешевле",
    icon: "feature-delivery.svg",
    parameter: () => `До ${state.deliveryAmount} ₽`,
    price: "Бесплатно",
    free: true,
    sheet: "delivery"
  },
  {
    id: "mail",
    group: "recommended",
    title: "Рассылка по покупателям",
    description: "Отправим скидку 10% лично тем,<br>кто добавит товар в избранное",
    icon: "feature-mail.svg",
    parameter: () => "До 30 получателей",
    price: "56 ₽"
  },
  {
    id: "xl",
    group: "additional",
    title: "XL размер объявления",
    description: "Покупатели не уйдут к другим<br>продавцам",
    icon: "feature-xl.svg",
    parameter: () => "7 дней",
    price: "120 ₽"
  },
  {
    id: "color",
    group: "additional",
    title: "Выделение цены цветом",
    description: "Ваш товар увидит больше людей<br>1–3 контакта · 18–84 просмотра",
    icon: "feature-color.svg",
    iconOverlay: "feature-color-roller.svg",
    parameter: () => "7 дней",
    price: "120 ₽"
  }
];

const summaryCatalog = [
  { id: "product", label: "Скидка на товар", old: "300 ₽", current: "0 ₽", strikeOld: false },
  { id: "delivery", label: "Скидка на доставку", old: "100 ₽", current: "0 ₽", strikeOld: false },
  { id: "promote", label: "Поднять в поиске", old: "120 ₽", current: "68 ₽", strikeOld: true },
  { id: "mail", label: "Рассылка скидок", old: "200 ₽", current: "88 ₽", strikeOld: true }
];

const competitionContent = {
  low: {
    label: "Низкая конкурентность",
    description: "Похожие предложения могут быть заметнее вашего",
    rows: [
      ["competition-high-1.png", "Добавьте продвижение, чтобы подняться выше в поиске"],
      ["competition-high-2.png", "Скидка сделает цену привлекательнее"],
      ["competition-high-3.png", "Выгодная доставка расширит географию заказов"]
    ]
  },
  medium: {
    label: "Средняя конкурентность",
    description: "Объявление уже заметно, но его можно усилить",
    rows: [
      ["competition-high-1.png", "Продвижение даст больше просмотров"],
      ["competition-high-2.png", "Скидка помогает не терять покупателей"],
      ["competition-high-3.png", "Выгодная доставка повышает интерес"]
    ]
  },
  high: {
    label: "Высокая конкурентность",
    description: "Сравниваем товары разных продавцов и определяем, что помогает продавать",
    rows: [
      ["competition-high-1.png", "Ваше обьявление будет выше 97% других в поиске и рекомендациях"],
      ["competition-high-2.png", "Цена товара привлекательнее 60% товаров конкурентов"],
      ["competition-high-3.png", "Товар могут заказать из других регионов по сниженной цене"]
    ]
  }
};

const state = {
  enabled: {
    promote: true,
    product: true,
    delivery: true,
    mail: true,
    xl: false,
    color: false
  },
  productPercent: 10,
  deliveryAmount: 200,
  promotionDays: 7,
  promotionBudget: 200,
  activeSheet: null,
  competitionTab: "high",
  toastTimer: null
};

const elements = {
  device: document.querySelector("[data-device]"),
  mainScroll: document.querySelector("[data-main-scroll]"),
  recommendedList: document.querySelector("[data-recommended-list]"),
  additionalList: document.querySelector("[data-additional-list]"),
  recommendation: document.querySelector("[data-recommendation]"),
  masterToggle: document.querySelector("[data-master-toggle]"),
  checkoutFooter: document.querySelector("[data-checkout-footer]"),
  productThumbnail: document.querySelector("[data-product-thumbnail]"),
  currentPrice: document.querySelector("[data-current-price]"),
  oldPrice: document.querySelector("[data-old-price]"),
  competitionLabel: document.querySelector("[data-competition-label]"),
  summaryLabel: document.querySelector("[data-summary-label]"),
  summaryPrice: document.querySelector("[data-summary-price]"),
  backdrop: document.querySelector("[data-backdrop]"),
  productValue: document.querySelector("[data-product-value]"),
  productChips: document.querySelector("[data-product-chips]"),
  deliveryValue: document.querySelector("[data-delivery-value]"),
  deliveryRange: document.querySelector("[data-delivery-range]"),
  deliveryBannerTitle: document.querySelector("[data-delivery-banner-title]"),
  payoutPrice: document.querySelector("[data-payout-price]"),
  durationChips: document.querySelector("[data-duration-chips]"),
  budgetCards: document.querySelector("[data-budget-cards]"),
  promotionDays: document.querySelector("[data-promotion-days]"),
  promotionResult: document.querySelector("[data-promotion-result]"),
  summaryLines: document.querySelector("[data-summary-lines]"),
  competitionDescription: document.querySelector("[data-competition-description]"),
  competitionTabs: document.querySelector("[data-competition-tabs]"),
  competitionList: document.querySelector("[data-competition-list]"),
  toast: document.querySelector("[data-toast]")
};

function createFeatureRow(feature) {
  const row = document.createElement("article");
  row.className = "benefit-row";
  row.dataset.feature = feature.id;

  if (feature.sheet) {
    const open = document.createElement("button");
    open.type = "button";
    open.className = "benefit-open";
    open.setAttribute("aria-label", `Настроить: ${feature.title}`);
    open.addEventListener("click", () => openSheet(feature.sheet));
    row.append(open);
  }

  const iconShell = document.createElement("span");
  iconShell.className = `benefit-icon benefit-icon-${feature.id}`;

  const icon = document.createElement("img");
  icon.className = "benefit-icon-glyph";
  icon.src = `../assets/${feature.icon}`;
  icon.alt = "";
  iconShell.append(icon);

  if (feature.iconOverlay) {
    const overlay = document.createElement("img");
    overlay.className = "benefit-icon-overlay";
    overlay.src = `../assets/${feature.iconOverlay}`;
    overlay.alt = "";
    iconShell.append(overlay);
  }

  const copy = document.createElement("div");
  copy.className = "benefit-copy";
  copy.innerHTML = `<span class="benefit-title">${feature.title}</span><span class="benefit-description">${feature.description}</span>`;

  const controls = document.createElement("div");
  controls.className = "benefit-controls";

  const parameter = document.createElement("button");
  parameter.type = "button";
  parameter.className = "parameter-chip";
  parameter.innerHTML = `<span>${feature.parameter()}</span><img src="../assets/chevron-down.svg" alt="">`;
  parameter.addEventListener("click", () => feature.sheet ? openSheet(feature.sheet) : showToast("Настройка появится в следующем макете"));

  const price = document.createElement("span");
  price.className = `benefit-price ${feature.free ? "is-free" : ""}`;
  price.innerHTML = feature.free ? `${feature.price}<img src="../assets/question-success.svg" alt="Подробнее">` : feature.price;
  controls.append(parameter, price);
  copy.append(controls);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "switch";
  toggle.setAttribute("role", "switch");
  toggle.setAttribute("aria-label", feature.title);
  toggle.setAttribute("aria-checked", String(state.enabled[feature.id]));
  toggle.addEventListener("click", () => {
    state.enabled[feature.id] = !state.enabled[feature.id];
    render();
  });

  row.append(iconShell, copy, toggle);
  return row;
}

function renderFeatureLists() {
  const recommended = featureCatalog.filter((feature) => feature.group === "recommended").map(createFeatureRow);
  const additional = featureCatalog.filter((feature) => feature.group === "additional").map(createFeatureRow);
  elements.recommendedList.replaceChildren(...recommended);
  elements.additionalList.replaceChildren(...additional);
}

function renderRecommendation() {
  const recommendedIds = featureCatalog.filter((feature) => feature.group === "recommended").map((feature) => feature.id);
  const allEnabled = recommendedIds.every((id) => state.enabled[id]);
  elements.recommendation.classList.toggle("is-inactive", !allEnabled);
  elements.masterToggle.textContent = allEnabled ? "Отключить" : "Включить все";
}

function getSelectedFeatures() {
  return featureCatalog.filter((feature) => state.enabled[feature.id]);
}

function renderCheckout() {
  const selected = getSelectedFeatures();
  const selectedRecommended = selected.filter((feature) => feature.group === "recommended");
  const allRecommended = selectedRecommended.length === 4;
  const isEmpty = selected.length === 0;
  const onlyDiscounts = selectedRecommended.length === 2 && state.enabled.product && state.enabled.delivery;
  const level = allRecommended ? "high" : isEmpty ? "low" : "medium";

  elements.checkoutFooter.classList.toggle("is-empty", isEmpty);
  elements.productThumbnail.src = isEmpty
    ? "../assets/product-thumbnail-off.png"
    : allRecommended
      ? "../assets/product-thumbnail.png"
      : "../assets/product-thumbnail-manual.png";
  elements.currentPrice.textContent = state.enabled.product ? "4 500 ₽" : "5 000 ₽";
  elements.oldPrice.textContent = state.enabled.product ? "5 000 ₽" : "";
  elements.oldPrice.hidden = !state.enabled.product;
  elements.competitionLabel.textContent = competitionContent[level].label;
  state.competitionTab = level;

  if (allRecommended) {
    elements.summaryLabel.textContent = "4 преимущества, 2 платных";
    elements.summaryPrice.innerHTML = "150 ₽ <s>320 ₽</s>";
  } else if (onlyDiscounts) {
    elements.summaryLabel.textContent = "2 скидки";
    elements.summaryPrice.textContent = "выплатим от 4 300 ₽";
  } else {
    elements.summaryLabel.textContent = `${selected.length} ${pluralize(selected.length, "преимущество", "преимущества", "преимуществ")}`;
    elements.summaryPrice.textContent = selected.length ? `${selected.filter((item) => !item.free).length * 120} ₽` : "";
  }
}

function renderProductControls() {
  elements.productValue.textContent = state.productPercent ? `${state.productPercent}%` : "Введите скидку";
  elements.productChips.replaceChildren(...[5, 10, 20, 30, 40].map((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-chip ${state.productPercent === value ? "is-selected" : ""}`;
    button.textContent = `${value}%`;
    button.addEventListener("click", () => {
      state.productPercent = value;
      renderProductControls();
    });
    return button;
  }));
}

function renderDeliveryControls() {
  const progress = ((state.deliveryAmount - 50) / 1450) * 100;
  const freeShare = Math.min(100, Math.round(state.deliveryAmount / 4));
  elements.deliveryValue.textContent = `${formatNumber(state.deliveryAmount)} ₽`;
  elements.deliveryRange.value = String(state.deliveryAmount);
  elements.deliveryRange.style.setProperty("--progress", `${progress}%`);
  elements.deliveryBannerTitle.textContent = `Оптимально — ${formatNumber(state.deliveryAmount)} ₽.`;
  document.querySelector("[data-delivery-banner-copy]").textContent = `Для ${freeShare}% покупателей доставка будет бесплатной, остальным скидка.`;
  elements.payoutPrice.textContent = `от ${formatNumber(4500 - state.deliveryAmount)} ₽`;
}

function renderPromotionControls() {
  const durations = [1, 5, 7, 14, 30, "Другой срок"];
  elements.durationChips.replaceChildren(...durations.map((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `duration-chip ${state.promotionDays === value ? "is-selected" : ""}`;
    button.textContent = String(value);
    button.addEventListener("click", () => {
      if (typeof value === "number") {
        state.promotionDays = value;
        renderPromotionControls();
      } else {
        showToast("Выбор произвольной даты появится в следующем макете");
      }
    });
    return button;
  }));

  const budgets = [
    { price: 123, views: "~42–333", art: "promotion-art-6.png" },
    { price: 200, views: "~42–333", art: "promotion-art-3.png" },
    { price: 600, views: "~42–333", art: "promotion-art-2.png" },
    { price: "Другой бюджет", custom: true }
  ];
  elements.budgetCards.replaceChildren(...budgets.map((budget) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `budget-card ${budget.custom ? "is-custom" : ""} ${state.promotionBudget === budget.price ? "is-selected" : ""}`;
    button.innerHTML = budget.custom
      ? `<small>${budget.price}</small>`
      : `<strong>${budget.price} ₽</strong><span>Прирост просмотров</span><small>${budget.views}</small><img src="../assets/${budget.art}" alt="">`;
    button.addEventListener("click", () => {
      if (budget.custom) {
        showToast("Выбор другого бюджета появится в следующем макете");
        return;
      }
      state.promotionBudget = budget.price;
      renderPromotionControls();
    });
    return button;
  }));

  elements.promotionDays.textContent = String(Math.max(1, Math.round(state.promotionBudget / 8.7)));
  elements.promotionResult.textContent = "Когда объявление соберёт столько контактов, оно опустится в поиске";
}

function renderSummary() {
  elements.summaryLines.replaceChildren(...summaryCatalog.map((item) => {
    const line = document.createElement("div");
    line.className = "summary-line";
    const previousPrice = item.strikeOld ? `<s>${item.old}</s>` : `<span>${item.old}</span>`;
    line.innerHTML = `<span>${item.label}</span><span class="summary-line-dot"></span><span class="summary-line-value">${previousPrice}<span class="${item.current === "0 ₽" ? "free" : ""}">${item.current}</span></span>`;
    return line;
  }));
}

function renderCompetition() {
  const keys = ["low", "medium", "high"];
  const labels = ["Низкая", "Средняя", "Высокая"];
  elements.competitionTabs.replaceChildren(...keys.map((key, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `competition-tab ${state.competitionTab === key ? "is-selected" : ""}`;
    button.textContent = labels[index];
    button.addEventListener("click", () => {
      state.competitionTab = key;
      renderCompetition();
    });
    return button;
  }));

  const content = competitionContent[state.competitionTab];
  elements.competitionDescription.textContent = content.description;
  elements.competitionList.replaceChildren(...content.rows.map(([icon, text]) => {
    const row = document.createElement("div");
    row.className = "competition-list-item";
    row.innerHTML = `<span class="competition-list-icon"><img src="../assets/${icon}" alt=""></span><p>${text}</p>`;
    return row;
  }));
}

function render() {
  renderFeatureLists();
  renderRecommendation();
  renderCheckout();
  renderProductControls();
  renderDeliveryControls();
  renderPromotionControls();
  renderSummary();
  renderCompetition();
}

function openSheet(name) {
  const sheet = document.querySelector(`[data-sheet="${name}"]`);

  if (!sheet) {
    return;
  }

  closeSheet(false);
  elements.device.scrollTop = 0;
  state.activeSheet = name;
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  elements.backdrop.classList.add("is-visible");
}

function closeSheet(animate = true) {
  const sheet = state.activeSheet ? document.querySelector(`[data-sheet="${state.activeSheet}"]`) : null;

  if (sheet) {
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
  }

  state.activeSheet = null;
  elements.device.scrollTop = 0;
  elements.backdrop.classList.remove("is-visible");

  if (!animate) {
    elements.backdrop.getAnimations().forEach((animation) => animation.finish());
  }
}

function applyFeature(id) {
  state.enabled[id] = true;
  closeSheet();
  render();
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function pluralize(number, one, few, many) {
  const modulo100 = number % 100;
  const modulo10 = number % 10;

  if (modulo100 >= 11 && modulo100 <= 19) {
    return many;
  }

  if (modulo10 === 1) {
    return one;
  }

  if (modulo10 >= 2 && modulo10 <= 4) {
    return few;
  }

  return many;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function syncDeviceScale() {
  const scale = Math.min(window.innerWidth / 375, window.innerHeight / 812, 1);
  elements.device.style.transform = `scale(${scale})`;
  document.body.style.gridTemplateRows = `${812 * scale}px`;
}

elements.masterToggle.addEventListener("click", () => {
  const recommendedIds = featureCatalog.filter((feature) => feature.group === "recommended").map((feature) => feature.id);
  const allEnabled = recommendedIds.every((id) => state.enabled[id]);
  recommendedIds.forEach((id) => {
    state.enabled[id] = !allEnabled;
  });
  render();
});

document.querySelectorAll("[data-open-sheet]").forEach((button) => {
  button.addEventListener("click", () => openSheet(button.dataset.openSheet));
});

document.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", () => closeSheet()));
elements.backdrop.addEventListener("click", () => closeSheet());
document.querySelector("[data-clear-product]").addEventListener("click", () => {
  state.productPercent = 0;
  renderProductControls();
});
document.querySelector("[data-clear-delivery]").addEventListener("click", () => {
  state.deliveryAmount = 50;
  renderDeliveryControls();
});
elements.deliveryRange.addEventListener("input", (event) => {
  state.deliveryAmount = Number(event.target.value);
  renderDeliveryControls();
});
document.querySelector("[data-apply-product]").addEventListener("click", () => applyFeature("product"));
document.querySelector("[data-apply-delivery]").addEventListener("click", () => applyFeature("delivery"));
document.querySelector("[data-apply-promotion]").addEventListener("click", () => applyFeature("promote"));
document.querySelector("[data-summary-apply]").addEventListener("click", () => {
  featureCatalog.filter((feature) => feature.group === "recommended").forEach((feature) => {
    state.enabled[feature.id] = true;
  });
  closeSheet();
  render();
  showToast("Преимущества подключены");
});
document.querySelector("[data-continue]").addEventListener("click", () => showToast("Следующий экран не показан в макете"));

document.querySelectorAll(".sheet").forEach((sheet) => {
  let startY = 0;
  sheet.addEventListener("pointerdown", (event) => {
    startY = event.clientY;
  }, { passive: true });
  sheet.addEventListener("pointerup", (event) => {
    if (event.clientY - startY > 90) {
      closeSheet();
    }
  }, { passive: true });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSheet();
  }
});
window.addEventListener("resize", syncDeviceScale);

render();
syncDeviceScale();
