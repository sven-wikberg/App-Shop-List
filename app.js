const STORAGE_KEYS = {
  products: "juste-ce-quil-faut.products.v5",
  needed: "juste-ce-quil-faut.needed.v5",
  categories: "juste-ce-quil-faut.categories.v1",
  internalBackup: "juste-ce-quil-faut.internal-backup.v1",
};

const DEFAULT_CATEGORIES = [
  "Cuisine",
  "Salle de bain",
  "Toilettes",
  "Buanderie",
  "Entretien",
  "Vêtements à renouveler",
  "Autre",
];

const DEFAULT_PRODUCTS = [
  {
    id: "liquide-vaisselle",
    name: "Liquide vaisselle",
    brand: "Rainett",
    detail: "Citron vert",
    format: "500 ml",
    category: "Cuisine",
    quantity: 2,
    icon: "🫧",
    image: "",
    accent: "#dbe9d7",
  },
  {
    id: "eponges",
    name: "Éponges grattantes",
    brand: "Spontex",
    detail: "Spécial vaisselle",
    format: "Paquet de 3",
    category: "Cuisine",
    quantity: 1,
    icon: "🧽",
    image: "",
    accent: "#f5e1a8",
  },
  {
    id: "papier-cuisson",
    name: "Papier cuisson",
    brand: "Albal",
    detail: "Anti-adhérent",
    format: "16 feuilles",
    category: "Cuisine",
    quantity: 1,
    icon: "📜",
    image: "",
    accent: "#eadfcf",
  },
  {
    id: "savon-mains",
    name: "Savon pour les mains",
    brand: "Le Petit Marseillais",
    detail: "Fleur d’oranger",
    format: "300 ml",
    category: "Salle de bain",
    quantity: 2,
    icon: "🧴",
    image: "",
    accent: "#f3d8bd",
  },
  {
    id: "dentifrice",
    name: "Dentifrice",
    brand: "Sensodyne",
    detail: "Soin complet",
    format: "75 ml",
    category: "Salle de bain",
    quantity: 2,
    icon: "🪥",
    image: "",
    accent: "#d8e7ea",
  },
  {
    id: "lessive",
    name: "Lessive capsules",
    brand: "Persil",
    detail: "3 en 1 — fraîcheur naturelle",
    format: "22 capsules",
    category: "Buanderie",
    quantity: 1,
    icon: "👕",
    image: "",
    accent: "#d6e3d9",
  },
  {
    id: "sacs-poubelle",
    name: "Sacs-poubelle",
    brand: "Handy Bag",
    detail: "Coulissants — ultra résistants",
    format: "30 L · x15",
    category: "Entretien",
    quantity: 2,
    icon: "🗑️",
    image: "",
    accent: "#d9ddd4",
  },
  {
    id: "papier-toilette",
    name: "Papier toilette",
    brand: "Lotus",
    detail: "Confort — 3 épaisseurs",
    format: "Paquet de 12",
    category: "Toilettes",
    quantity: 1,
    icon: "🧻",
    image: "",
    accent: "#eadeda",
  },
];

const CLOTHING_EXAMPLES = [
  {
    id: "chaussettes-noires",
    name: "Chaussettes noires",
    brand: "Uniqlo",
    detail: "Coton — noir",
    format: "Lot de 4 paires",
    category: "Vêtements à renouveler",
    quantity: 1,
    icon: "🧦",
    image: "",
    accent: "#ded9cf",
  },
  {
    id: "boxers-noirs",
    name: "Boxers noirs",
    brand: "DIM",
    detail: "Coton stretch — noir",
    format: "Lot de 3",
    category: "Vêtements à renouveler",
    quantity: 1,
    icon: "🩳",
    image: "",
    accent: "#d9dce3",
  },
];

const DEFAULT_MINIMUM_STOCK = {
  "liquide-vaisselle": 1,
  eponges: 1,
  "papier-cuisson": 1,
  "savon-mains": 1,
  dentifrice: 1,
  lessive: 1,
  "sacs-poubelle": 1,
  "papier-toilette": 1,
  "chaussettes-noires": 6,
  "boxers-noirs": 5,
};

const CATEGORY_ACCENTS = ["#dbe9d7", "#f5e1a8", "#eadfcf", "#d8e7ea", "#f3d8bd", "#e1dced"];
const DEFAULT_PRODUCT_IMAGE = "assets/product-placeholder.png";

function normalizeProducts(products) {
  return products.map((product) => ({
    ...product,
    minimumStock:
      product.minimumStock === undefined
        ? DEFAULT_MINIMUM_STOCK[product.id] ?? 1
        : Math.max(0, Number.parseInt(product.minimumStock, 10) || 0),
  }));
}

function loadInitialProducts() {
  const products = loadJSON(STORAGE_KEYS.products, []);
  return Array.isArray(products) ? normalizeProducts(products) : [];
}

function loadInitialNeeded() {
  const needed = loadJSON(STORAGE_KEYS.needed, []);
  return Array.isArray(needed) ? needed : [];
}

const state = {
  products: loadInitialProducts(),
  needed: new Set(loadInitialNeeded()),
  categories: loadJSON(STORAGE_KEYS.categories, DEFAULT_CATEGORIES),
  reviewCategory: "",
  reviewQueue: [],
  reviewIndex: 0,
  completedCategories: new Set(),
  decisionLocked: false,
  decisionTimer: null,
};

state.categories = [
  ...new Set([
    ...(Array.isArray(state.categories) ? state.categories : DEFAULT_CATEGORIES),
    ...state.products.map((product) => product.category).filter(Boolean),
  ]),
];

const elements = {
  shoppingList: document.querySelector("#shoppingList"),
  listEmpty: document.querySelector("#listEmpty"),
  listCount: document.querySelector("#listCount"),
  shareListButton: document.querySelector("#shareListButton"),
  shareTopButton: document.querySelector("#shareTopButton"),
  copyListButton: document.querySelector("#copyListButton"),
  clearListButton: document.querySelector("#clearListButton"),
  locationStage: document.querySelector("#locationStage"),
  reviewStage: document.querySelector("#reviewStage"),
  completeStage: document.querySelector("#completeStage"),
  locationGrid: document.querySelector("#locationGrid"),
  reviewCard: document.querySelector("#reviewCard"),
  reviewRoom: document.querySelector("#reviewRoom"),
  reviewProgressText: document.querySelector("#reviewProgressText"),
  reviewProgressBar: document.querySelector("#reviewProgressBar"),
  completeRoom: document.querySelector("#completeRoom"),
  completeSummary: document.querySelector("#completeSummary"),
  shoppingView: document.querySelector("#shoppingView"),
  productView: document.querySelector("#productView"),
  productForm: document.querySelector("#productForm"),
  productFormTitle: document.querySelector("#productFormTitle"),
  productSubmitLabel: document.querySelector("#productSubmitLabel"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryName: document.querySelector("#categoryName"),
  categoryOriginalName: document.querySelector("#categoryOriginalName"),
  categorySubmitLabel: document.querySelector("#categorySubmitLabel"),
  cancelCategoryButton: document.querySelector("#cancelCategoryButton"),
  categoryList: document.querySelector("#categoryList"),
  saveInternalBackupButton: document.querySelector("#saveInternalBackupButton"),
  loadInternalBackupButton: document.querySelector("#loadInternalBackupButton"),
  exportBackupButton: document.querySelector("#exportBackupButton"),
  backupFileInput: document.querySelector("#backupFileInput"),
  manageProductList: document.querySelector("#manageProductList"),
  libraryCount: document.querySelector("#libraryCount"),
  toast: document.querySelector("#toast"),
};

function loadJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast("Impossible d’enregistrer sur cet appareil.");
    return false;
  }
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCategories() {
  return [...new Set(state.products.map((product) => product.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "fr")
  );
}

function renderCategoryOptions() {
  const select = document.querySelector("#productCategory");
  const currentValue = select.value;
  select.innerHTML = `
    <option value="" disabled>Choisir un endroit</option>
    ${state.categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}`;
  if (state.categories.includes(currentValue)) select.value = currentValue;
}

function renderCategoryManager() {
  elements.categoryList.innerHTML = state.categories.length
    ? state.categories
        .map((category) => {
          const productCount = state.products.filter((product) => product.category === category).length;
          return `
            <div class="category-row" data-category-name="${escapeHTML(category)}">
              <span class="category-row-icon" aria-hidden="true">${roomIcon(category)}</span>
              <div>
                <strong>${escapeHTML(category)}</strong>
                <small>${productCount} produit${productCount > 1 ? "s" : ""}</small>
              </div>
              <div class="category-row-actions">
                <button class="mini-button" type="button" data-category-action="edit" aria-label="Modifier ${escapeHTML(category)}">✎</button>
                <button class="mini-button" type="button" data-category-action="delete" aria-label="Supprimer ${escapeHTML(category)}">×</button>
              </div>
            </div>`;
        })
        .join("")
    : `<div class="manage-empty">Aucune catégorie. Ajoutez-en une pour créer un produit.</div>`;
}

function persistCategories() {
  saveJSON(STORAGE_KEYS.categories, state.categories);
}

function resetCategoryForm() {
  elements.categoryForm.reset();
  elements.categoryOriginalName.value = "";
  elements.categorySubmitLabel.textContent = "Ajouter";
  elements.cancelCategoryButton.hidden = true;
}

function editCategory(category) {
  elements.categoryOriginalName.value = category;
  elements.categoryName.value = category;
  elements.categorySubmitLabel.textContent = "Enregistrer";
  elements.cancelCategoryButton.hidden = false;
  elements.categoryName.focus();
}

function deleteCategory(category) {
  const productCount = state.products.filter((product) => product.category === category).length;
  if (productCount) {
    window.alert(`Cette catégorie contient ${productCount} produit${productCount > 1 ? "s" : ""}. Déplacez-les avant de la supprimer.`);
    return;
  }
  if (!window.confirm(`Supprimer la catégorie « ${category} » ?`)) return;
  state.categories = state.categories.filter((item) => item !== category);
  state.completedCategories.delete(category);
  persistCategories();
  resetCategoryForm();
  render();
  showToast("Catégorie supprimée");
}

function handleCategorySubmit(event) {
  event.preventDefault();
  const name = elements.categoryName.value.trim().replace(/\s+/g, " ");
  const originalName = elements.categoryOriginalName.value;
  if (!name) return;
  const duplicate = state.categories.some(
    (category) => normalize(category) === normalize(name) && category !== originalName
  );
  if (duplicate) {
    showToast("Cette catégorie existe déjà");
    return;
  }

  if (originalName) {
    state.categories = state.categories.map((category) => (category === originalName ? name : category));
    state.products = state.products.map((product) =>
      product.category === originalName ? { ...product, category: name } : product
    );
    state.completedCategories.delete(originalName);
    saveJSON(STORAGE_KEYS.products, state.products);
  } else {
    state.categories.push(name);
  }

  persistCategories();
  resetCategoryForm();
  render();
  showToast(originalName ? "Catégorie modifiée" : "Catégorie ajoutée");
}

function createBackupData() {
  return {
    app: "juste-ce-quil-faut",
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: state.categories,
    products: state.products,
    needed: [...state.needed],
  };
}

function exportBackup() {
  const backup = createBackupData();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `juste-ce-quil-faut-sauvegarde-${date}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Sauvegarde téléchargée");
}

function validateBackupProduct(product) {
  if (!product || typeof product !== "object") throw new Error("Produit invalide");
  const name = String(product.name || "").trim();
  const category = String(product.category || "").trim();
  if (!name || !category) throw new Error("Produit incomplet");
  return {
    id: String(product.id || makeId(name)),
    name,
    brand: String(product.brand || "").trim(),
    detail: String(product.detail || "").trim(),
    format: String(product.format || "").trim(),
    category,
    minimumStock: Math.max(0, Number.parseInt(product.minimumStock, 10) || 0),
    quantity: Math.max(1, Number.parseInt(product.quantity, 10) || 1),
    icon: String(product.icon || "📦"),
    image: typeof product.image === "string" ? product.image : DEFAULT_PRODUCT_IMAGE,
    accent: /^#[0-9a-f]{6}$/i.test(product.accent || "") ? product.accent : CATEGORY_ACCENTS[0],
  };
}

function applyBackup(backup) {
  if (backup?.app !== "juste-ce-quil-faut" || !Array.isArray(backup.products) || !Array.isArray(backup.categories)) {
    throw new Error("Format de sauvegarde inconnu");
  }
  const products = backup.products.map(validateBackupProduct);
  const categories = [
    ...new Set([
      ...backup.categories.map((category) => String(category).trim()).filter(Boolean),
      ...products.map((product) => product.category),
    ]),
  ];
  const productIds = new Set(products.map((product) => product.id));
  const needed = Array.isArray(backup.needed)
    ? backup.needed.filter((id) => productIds.has(String(id))).map(String)
    : [];

  if (!window.confirm(`Restaurer ${products.length} produit${products.length > 1 ? "s" : ""} ? Les données actuelles seront remplacées.`)) {
    return false;
  }

  state.products = products;
  state.categories = categories;
  state.needed = new Set(needed);
  state.completedCategories.clear();
  saveJSON(STORAGE_KEYS.products, state.products);
  persistCategories();
  persistNeeded();
  resetCategoryForm();
  render();
  goToHome();
  showToast("Sauvegarde restaurée");
  return true;
}

async function restoreBackup(file) {
  try {
    applyBackup(JSON.parse(await file.text()));
  } catch {
    window.alert("Ce fichier ne semble pas être une sauvegarde valide de l’application.");
  } finally {
    elements.backupFileInput.value = "";
  }
}

function saveInternalBackup() {
  if (saveJSON(STORAGE_KEYS.internalBackup, createBackupData())) {
    showToast("Sauvegarde interne enregistrée");
  }
}

function loadInternalBackup() {
  const backup = loadJSON(STORAGE_KEYS.internalBackup, null);
  if (!backup) {
    window.alert("Aucune sauvegarde interne n’a encore été créée.");
    return;
  }

  try {
    applyBackup(backup);
  } catch {
    window.alert("La sauvegarde interne est illisible.");
  }
}

function accentFor(product) {
  if (product.accent && /^#[0-9a-f]{6}$/i.test(product.accent)) return product.accent;
  const categoryIndex = Math.max(0, getCategories().indexOf(product.category));
  return CATEGORY_ACCENTS[categoryIndex % CATEGORY_ACCENTS.length];
}

function referenceLine(product) {
  return [product.brand, product.detail, product.format].filter(Boolean).join(" · ") || "Référence à compléter";
}

function visualMarkup(product, className = "product-visual") {
  const content = `<img src="${escapeHTML(product.image || DEFAULT_PRODUCT_IMAGE)}" alt="" />`;
  return `<div class="${className}" style="--product-accent:${accentFor(product)}">${content}</div>`;
}

function roomIcon(category) {
  const normalized = normalize(category);
  if (normalized.includes("vetement") || normalized.includes("habit")) return "🧦";
  if (normalized.includes("cuisine")) return "🍽️";
  if (normalized.includes("bain")) return "🫧";
  if (normalized.includes("buander")) return "👕";
  if (normalized.includes("toilet")) return "🧻";
  if (normalized.includes("entretien")) return "✨";
  return "🗄️";
}

function renderLocations() {
  const categories = getCategories();
  if (!categories.length) {
    elements.locationGrid.innerHTML = `
      <div class="location-empty">
        <span aria-hidden="true">＋</span>
        <h3>Aucun produit pour l’instant</h3>
        <p>Créez votre première référence pour commencer la vérification.</p>
        <button class="button button-dark" type="button" data-open-products>Créer un produit</button>
      </div>`;
    return;
  }

  elements.locationGrid.innerHTML = categories
    .map((category, index) => {
      const products = state.products.filter((product) => product.category === category);
      const neededCount = products.filter((product) => state.needed.has(product.id)).length;
      const completed = state.completedCategories.has(category);
      return `
        <button class="location-card ${completed ? "is-complete" : ""}" type="button" data-location="${escapeHTML(category)}" style="--room-accent:${CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]}">
          <span class="location-icon" aria-hidden="true">${roomIcon(category)}</span>
          <span class="location-copy">
            <strong>${escapeHTML(category)}</strong>
            <small>${products.length} produit${products.length > 1 ? "s" : ""}</small>
          </span>
          <span class="location-status">${completed ? `✓ Fait${neededCount ? ` · ${neededCount} retenu${neededCount > 1 ? "s" : ""}` : ""}` : "Commencer →"}</span>
        </button>`;
    })
    .join("");
}

function renderManageProducts() {
  elements.libraryCount.textContent = `${state.products.length} référence${state.products.length > 1 ? "s" : ""}`;
  elements.manageProductList.innerHTML = state.products.length
    ? state.products
        .map(
          (product) => `
            <article class="manage-product-row" data-manage-id="${escapeHTML(product.id)}">
              ${visualMarkup(product, "manage-product-thumb")}
              <div class="manage-product-copy">
                <span>${escapeHTML(product.category)}</span>
                <strong>${escapeHTML(product.name)}</strong>
                <small>${escapeHTML(referenceLine(product))}</small>
              </div>
              <strong class="manage-product-quantity">min. ${product.minimumStock} · +${product.quantity}</strong>
              <div class="manage-product-actions">
                <button class="mini-button" type="button" data-manage-action="edit" aria-label="Modifier ${escapeHTML(product.name)}">✎</button>
                <button class="mini-button" type="button" data-manage-action="delete" aria-label="Supprimer ${escapeHTML(product.name)}">×</button>
              </div>
            </article>`
        )
        .join("")
    : `<div class="manage-empty">Aucune référence enregistrée.</div>`;
}

function showFlowStage(stageName) {
  elements.locationStage.hidden = stageName !== "locations";
  elements.reviewStage.hidden = stageName !== "review";
  elements.completeStage.hidden = stageName !== "complete";
}

function startReview(category) {
  if (state.decisionTimer) window.clearTimeout(state.decisionTimer);
  const queue = state.products.filter((product) => product.category === category);
  if (!queue.length) return;
  state.reviewCategory = category;
  state.reviewQueue = queue;
  state.reviewIndex = 0;
  state.decisionLocked = false;
  state.decisionTimer = null;
  showFlowStage("review");
  renderReviewCard();
}

function renderReviewCard() {
  const product = state.reviewQueue[state.reviewIndex];
  if (!product) {
    finishReview();
    return;
  }

  const current = state.reviewIndex + 1;
  const total = state.reviewQueue.length;
  elements.reviewRoom.textContent = state.reviewCategory;
  elements.reviewProgressText.textContent = `${current} sur ${total}`;
  elements.reviewProgressBar.style.width = `${(current / total) * 100}%`;
  elements.reviewCard.setAttribute("aria-label", `${product.name}. Choisissez pas besoin ou il en faut.`);
  elements.reviewCard.innerHTML = `
    <article class="swipe-card" data-review-id="${escapeHTML(product.id)}">
      <div class="swipe-verdict verdict-no">Pas besoin</div>
      <div class="swipe-verdict verdict-yes">Il en faut</div>
      <div class="swipe-card-image">
        <img src="${escapeHTML(product.image || DEFAULT_PRODUCT_IMAGE)}" alt="" />
        <span>${escapeHTML(product.category)}</span>
      </div>
      <div class="swipe-card-body">
        <p class="product-category">Référence ${current}/${total}</p>
        <h3>${escapeHTML(product.name)}</h3>
        <p class="swipe-reference">${escapeHTML(referenceLine(product))}</p>
        <div class="swipe-stock-rules">
          <div>
            <span>Minimum en stock</span>
            <strong>${product.minimumStock}</strong>
          </div>
          <div>
            <span>À acheter si besoin</span>
            <strong>${product.quantity}</strong>
          </div>
        </div>
      </div>
    </article>`;
  elements.reviewCard.focus({ preventScroll: true });
}

function decideCurrentProduct(isNeeded) {
  if (state.decisionLocked) return;
  const product = state.reviewQueue[state.reviewIndex];
  const card = elements.reviewCard.querySelector(".swipe-card");
  if (!product || !card) return;
  state.decisionLocked = true;
  card.style.transform = "";
  card.classList.add(isNeeded ? "leaving-right" : "leaving-left");

  state.decisionTimer = window.setTimeout(() => {
    if (isNeeded) state.needed.add(product.id);
    else state.needed.delete(product.id);
    persistNeeded();
    renderList();
    state.reviewIndex += 1;
    state.decisionLocked = false;
    state.decisionTimer = null;
    renderReviewCard();
  }, 210);
}

function goToHome() {
  if (state.decisionTimer) window.clearTimeout(state.decisionTimer);
  state.decisionTimer = null;
  state.decisionLocked = false;
  state.reviewQueue = [];
  state.reviewIndex = 0;
  state.reviewCategory = "";
  showFlowStage("locations");
  showView("shopping");
}

function finishReview() {
  state.completedCategories.add(state.reviewCategory);
  const retained = state.reviewQueue.filter((product) => state.needed.has(product.id)).length;
  elements.completeRoom.textContent = state.reviewCategory;
  elements.completeSummary.textContent = retained
    ? `${retained} produit${retained > 1 ? "s ont" : " a"} été ajouté${retained > 1 ? "s" : ""} à la liste.`
    : "Rien ne manque dans cet endroit.";
  showFlowStage("complete");
  renderLocations();
}

function selectedProducts() {
  return state.products.filter((product) => state.needed.has(product.id));
}

function renderList() {
  const products = selectedProducts();
  const hasItems = products.length > 0;
  elements.listCount.textContent = products.length;
  elements.listEmpty.hidden = hasItems;
  elements.shoppingList.hidden = !hasItems;
  elements.shareListButton.disabled = !hasItems;
  elements.shareTopButton.disabled = !hasItems;
  elements.copyListButton.disabled = !hasItems;
  elements.clearListButton.disabled = !hasItems;
  elements.shoppingList.innerHTML = products
    .map(
      (product) => `
        <div class="shopping-item" data-list-id="${escapeHTML(product.id)}">
          ${visualMarkup(product, "shopping-thumb")}
          <div class="shopping-text">
            <strong>${escapeHTML(product.name)}</strong>
            <span>${escapeHTML(referenceLine(product))}</span>
          </div>
          <div class="shopping-quantity">
            ×${product.quantity}
            <button class="remove-list-item" type="button" aria-label="Retirer ${escapeHTML(product.name)} de la liste">×</button>
          </div>
        </div>`
    )
    .join("");
}

function render() {
  renderCategoryOptions();
  renderCategoryManager();
  renderLocations();
  renderManageProducts();
  renderList();
}

function persistNeeded() {
  saveJSON(STORAGE_KEYS.needed, [...state.needed]);
}

function toggleNeeded(id, force) {
  const shouldAdd = typeof force === "boolean" ? force : !state.needed.has(id);
  if (shouldAdd) state.needed.add(id);
  else state.needed.delete(id);
  persistNeeded();
  renderList();
  renderLocations();
}

function showView(viewName) {
  const showingProducts = viewName === "products";
  elements.shoppingView.hidden = showingProducts;
  elements.productView.hidden = !showingProducts;
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    const isActive = button.dataset.viewTarget === viewName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openProductForm(product = null) {
  elements.productForm.reset();
  document.querySelector("#productId").value = product?.id || "";
  document.querySelector("#productName").value = product?.name || "";
  document.querySelector("#productBrand").value = product?.brand || "";
  document.querySelector("#productDetail").value = product?.detail || "";
  document.querySelector("#productFormat").value = product?.format || "";
  document.querySelector("#productCategory").value = product?.category || "Cuisine";
  document.querySelector("#productMinimumStock").value = product?.minimumStock ?? 1;
  document.querySelector("#productQuantity").value = product?.quantity || 1;
  elements.productFormTitle.textContent = product ? "Modifier le produit" : "Créer un produit";
  elements.productSubmitLabel.textContent = product ? "Enregistrer les modifications" : "Créer le produit";
  showView("products");
  requestAnimationFrame(() => document.querySelector("#productName").focus());
}

function makeId(name) {
  const base = normalize(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "produit";
  return `${base}-${Date.now().toString(36)}`;
}

function handleProductSubmit(event) {
  event.preventDefault();
  const existingId = document.querySelector("#productId").value;
  const existingProduct = state.products.find((product) => product.id === existingId);
  const category = document.querySelector("#productCategory").value.trim();
  const product = {
    id: existingId || makeId(document.querySelector("#productName").value),
    name: document.querySelector("#productName").value.trim(),
    brand: document.querySelector("#productBrand").value.trim(),
    detail: document.querySelector("#productDetail").value.trim(),
    format: document.querySelector("#productFormat").value.trim(),
    category,
    minimumStock: Math.max(0, Number.parseInt(document.querySelector("#productMinimumStock").value, 10) || 0),
    quantity: Math.max(1, Number.parseInt(document.querySelector("#productQuantity").value, 10) || 1),
    icon: existingProduct?.icon || "📦",
    image: existingProduct?.image || DEFAULT_PRODUCT_IMAGE,
    accent: existingProduct?.accent || CATEGORY_ACCENTS[getCategories().indexOf(category) % CATEGORY_ACCENTS.length] || CATEGORY_ACCENTS[0],
  };

  const nextProducts = existingProduct
    ? state.products.map((item) => (item.id === existingId ? product : item))
    : [...state.products, product];

  if (!saveJSON(STORAGE_KEYS.products, nextProducts)) return;
  state.products = nextProducts;
  state.completedCategories.delete(category);
  render();
  showFlowStage("locations");
  showView("shopping");
  showToast(existingProduct ? "Produit modifié" : "Produit ajouté");
}

function deleteProduct(product) {
  const confirmed = window.confirm(`Supprimer « ${product.name} » de vos références ?`);
  if (!confirmed) return;
  state.products = state.products.filter((item) => item.id !== product.id);
  state.needed.delete(product.id);
  state.completedCategories.delete(product.category);
  saveJSON(STORAGE_KEYS.products, state.products);
  persistNeeded();
  render();
  showToast("Produit supprimé");
}

function buildListText() {
  const products = selectedProducts();
  const groups = products.reduce((result, product) => {
    (result[product.category] ||= []).push(product);
    return result;
  }, {});
  const lines = ["MA LISTE DE COURSES", ""];
  Object.entries(groups).forEach(([category, items]) => {
    lines.push(category.toUpperCase());
    items.forEach((product) => {
      lines.push(`• ${product.quantity} × ${product.name} — ${referenceLine(product)}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

async function shareList() {
  if (!selectedProducts().length) return;
  if (navigator.share) {
    try {
      await navigator.share({ title: "Ma liste de courses", text: buildListText() });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  await copyList();
}

async function copyList() {
  try {
    await navigator.clipboard.writeText(buildListText());
    showToast("Liste copiée");
  } catch {
    const area = document.createElement("textarea");
    area.value = buildListText();
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("Liste copiée");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

document.querySelector("#addProductButton").addEventListener("click", () => openProductForm());
elements.shareTopButton.addEventListener("click", shareList);
document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  goToHome();
});
document.querySelector("#shoppingTab").addEventListener("click", goToHome);
document.querySelector("#productsTab").addEventListener("click", () => openProductForm());
document.querySelector("#backToListButton").addEventListener("click", goToHome);
document.querySelector("#cancelProductButton").addEventListener("click", goToHome);
elements.locationGrid.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-products]")) {
    openProductForm();
    return;
  }
  const location = event.target.closest("[data-location]");
  if (location) startReview(location.dataset.location);
});
document.querySelector("#backToLocationsButton").addEventListener("click", () => showFlowStage("locations"));
document.querySelector("#chooseAnotherLocationButton").addEventListener("click", () => showFlowStage("locations"));
document.querySelector("#restartLocationButton").addEventListener("click", () => startReview(state.reviewCategory));
document.querySelector("#reviewNoButton").addEventListener("click", () => decideCurrentProduct(false));
document.querySelector("#reviewYesButton").addEventListener("click", () => decideCurrentProduct(true));

elements.manageProductList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-manage-id]");
  const action = event.target.closest("[data-manage-action]")?.dataset.manageAction;
  if (!row || !action) return;
  const product = state.products.find((item) => item.id === row.dataset.manageId);
  if (!product) return;
  if (action === "edit") openProductForm(product);
  if (action === "delete") deleteProduct(product);
});

let swipeStartX = null;
let swipeDeltaX = 0;

elements.reviewCard.addEventListener("pointerdown", (event) => {
  if (state.decisionLocked) return;
  swipeStartX = event.clientX;
  swipeDeltaX = 0;
  elements.reviewCard.setPointerCapture?.(event.pointerId);
});

elements.reviewCard.addEventListener("pointermove", (event) => {
  if (swipeStartX === null || state.decisionLocked) return;
  swipeDeltaX = event.clientX - swipeStartX;
  const card = elements.reviewCard.querySelector(".swipe-card");
  if (!card) return;
  card.style.transform = `translateX(${swipeDeltaX}px) rotate(${swipeDeltaX / 28}deg)`;
  const opacity = Math.min(1, Math.abs(swipeDeltaX) / 90);
  card.querySelector(swipeDeltaX >= 0 ? ".verdict-yes" : ".verdict-no").style.opacity = opacity;
});

elements.reviewCard.addEventListener("pointerup", (event) => {
  if (swipeStartX === null) return;
  const shouldDecide = Math.abs(swipeDeltaX) > 75;
  const isNeeded = swipeDeltaX > 0;
  const card = elements.reviewCard.querySelector(".swipe-card");
  swipeStartX = null;
  if (card) {
    card.style.transform = "";
    card.querySelectorAll(".swipe-verdict").forEach((verdict) => (verdict.style.opacity = ""));
  }
  if (shouldDecide) decideCurrentProduct(isNeeded);
  elements.reviewCard.releasePointerCapture?.(event.pointerId);
});

elements.reviewCard.addEventListener("pointercancel", () => {
  swipeStartX = null;
  const card = elements.reviewCard.querySelector(".swipe-card");
  if (card) card.style.transform = "";
});

window.addEventListener("keydown", (event) => {
  if (elements.reviewStage.hidden || state.decisionLocked || event.target.matches("input, textarea")) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    decideCurrentProduct(false);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    decideCurrentProduct(true);
  }
});

elements.shoppingList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-list-id]");
  if (item && event.target.closest(".remove-list-item")) toggleNeeded(item.dataset.listId, false);
});

elements.shareListButton.addEventListener("click", shareList);
elements.copyListButton.addEventListener("click", copyList);
elements.clearListButton.addEventListener("click", () => {
  if (!selectedProducts().length) return;
  if (!window.confirm("Décocher tous les produits de la liste ?")) return;
  state.needed.clear();
  persistNeeded();
  renderList();
  renderLocations();
  showToast("Liste vidée");
});

elements.productForm.addEventListener("submit", handleProductSubmit);
elements.categoryForm.addEventListener("submit", handleCategorySubmit);
elements.cancelCategoryButton.addEventListener("click", resetCategoryForm);
elements.categoryList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-category-name]");
  const action = event.target.closest("[data-category-action]")?.dataset.categoryAction;
  if (!row || !action) return;
  const category = row.dataset.categoryName;
  if (action === "edit") editCategory(category);
  if (action === "delete") deleteCategory(category);
});
elements.saveInternalBackupButton.addEventListener("click", saveInternalBackup);
elements.loadInternalBackupButton.addEventListener("click", loadInternalBackup);
elements.exportBackupButton.addEventListener("click", exportBackup);
elements.backupFileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) restoreBackup(file);
});

state.needed = new Set([...state.needed].filter((id) => state.products.some((product) => product.id === id)));
saveJSON(STORAGE_KEYS.products, state.products);
persistNeeded();
persistCategories();
render();
