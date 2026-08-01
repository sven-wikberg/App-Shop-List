const STORAGE_KEYS = {
  products: "juste-ce-quil-faut.products.v2",
  needed: "juste-ce-quil-faut.needed.v2",
  settings: "juste-ce-quil-faut.settings.v1",
};

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

const CATEGORY_ACCENTS = ["#dbe9d7", "#f5e1a8", "#eadfcf", "#d8e7ea", "#f3d8bd", "#e1dced"];

const state = {
  products: loadJSON(STORAGE_KEYS.products, []),
  needed: new Set(loadJSON(STORAGE_KEYS.needed, [])),
  settings: loadJSON(STORAGE_KEYS.settings, { email: "", subject: "Ma liste de courses" }),
  activeCategory: "Tous",
  search: "",
};

const elements = {
  productGrid: document.querySelector("#productGrid"),
  shoppingList: document.querySelector("#shoppingList"),
  listEmpty: document.querySelector("#listEmpty"),
  emptyProducts: document.querySelector("#emptyProducts"),
  categoryTabs: document.querySelector("#categoryTabs"),
  inventoryCount: document.querySelector("#inventoryCount"),
  listCount: document.querySelector("#listCount"),
  emailListButton: document.querySelector("#emailListButton"),
  copyListButton: document.querySelector("#copyListButton"),
  clearListButton: document.querySelector("#clearListButton"),
  searchInput: document.querySelector("#searchInput"),
  productDialog: document.querySelector("#productDialog"),
  productForm: document.querySelector("#productForm"),
  productDialogTitle: document.querySelector("#productDialogTitle"),
  productImageData: document.querySelector("#productImageData"),
  photoPreview: document.querySelector("#photoPreview"),
  settingsDialog: document.querySelector("#settingsDialog"),
  settingsForm: document.querySelector("#settingsForm"),
  settingsEmail: document.querySelector("#settingsEmail"),
  settingsSubject: document.querySelector("#settingsSubject"),
  categorySuggestions: document.querySelector("#categorySuggestions"),
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
    showToast("La sauvegarde locale est pleine. Essayez une photo plus légère.");
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

function accentFor(product) {
  if (product.accent && /^#[0-9a-f]{6}$/i.test(product.accent)) return product.accent;
  const categoryIndex = Math.max(0, getCategories().indexOf(product.category));
  return CATEGORY_ACCENTS[categoryIndex % CATEGORY_ACCENTS.length];
}

function referenceLine(product) {
  return [product.brand, product.detail, product.format].filter(Boolean).join(" · ") || "Référence à compléter";
}

function renderCategories() {
  const categories = ["Tous", ...getCategories()];
  if (!categories.includes(state.activeCategory)) state.activeCategory = "Tous";
  elements.categoryTabs.innerHTML = categories
    .map(
      (category) => `
        <button
          class="category-tab ${category === state.activeCategory ? "active" : ""}"
          type="button"
          data-category="${escapeHTML(category)}"
          aria-pressed="${category === state.activeCategory}"
        >${escapeHTML(category)}</button>`
    )
    .join("");

  elements.categorySuggestions.innerHTML = getCategories()
    .map((category) => `<option value="${escapeHTML(category)}"></option>`)
    .join("");
}

function filteredProducts() {
  const term = normalize(state.search);
  return state.products.filter((product) => {
    const categoryMatches = state.activeCategory === "Tous" || product.category === state.activeCategory;
    const haystack = normalize([product.name, product.brand, product.detail, product.format, product.category].join(" "));
    return categoryMatches && (!term || haystack.includes(term));
  });
}

function visualMarkup(product, className = "product-visual") {
  const emojiClass = className === "shopping-thumb" ? "" : "product-emoji";
  const content = product.image
    ? `<img src="${escapeHTML(product.image)}" alt="" />`
    : `<span class="${emojiClass}" aria-hidden="true">${escapeHTML(product.icon || "🧺")}</span>`;
  return `<div class="${className}" style="--product-accent:${accentFor(product)}">${content}</div>`;
}

function renderProducts() {
  const products = filteredProducts();
  elements.inventoryCount.textContent = `${products.length} référence${products.length > 1 ? "s" : ""}`;
  elements.emptyProducts.hidden = products.length > 0;
  elements.productGrid.hidden = products.length === 0;
  elements.productGrid.innerHTML = products
    .map((product) => {
      const isNeeded = state.needed.has(product.id);
      return `
        <article class="product-card ${isNeeded ? "is-needed" : ""}" data-product-id="${escapeHTML(product.id)}">
          ${visualMarkup(product)}
          <div class="product-info">
            <p class="product-category">${escapeHTML(product.category)}</p>
            <h3 class="product-name">${escapeHTML(product.name)}</h3>
            <p class="product-reference">${escapeHTML(referenceLine(product))}</p>
            <div class="product-bottom">
              <span class="quantity-label">À acheter : ${product.quantity}</span>
              <button class="need-toggle" type="button" data-action="toggle" aria-pressed="${isNeeded}">
                ${isNeeded ? "✓ Il en faut" : "Il en faut"}
              </button>
            </div>
          </div>
          <div class="card-tools">
            <button class="mini-button" type="button" data-action="edit" title="Modifier" aria-label="Modifier ${escapeHTML(product.name)}">✎</button>
            <button class="mini-button" type="button" data-action="delete" title="Supprimer" aria-label="Supprimer ${escapeHTML(product.name)}">×</button>
          </div>
        </article>`;
    })
    .join("");
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
  elements.emailListButton.disabled = !hasItems;
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
  renderCategories();
  renderProducts();
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
  renderProducts();
  renderList();
}

function openProductDialog(product = null) {
  elements.productForm.reset();
  document.querySelector("#productId").value = product?.id || "";
  document.querySelector("#productName").value = product?.name || "";
  document.querySelector("#productBrand").value = product?.brand || "";
  document.querySelector("#productDetail").value = product?.detail || "";
  document.querySelector("#productFormat").value = product?.format || "";
  document.querySelector("#productCategory").value = product?.category || "Cuisine";
  document.querySelector("#productQuantity").value = product?.quantity || 1;
  document.querySelector("#productIcon").value = product?.icon || "🧺";
  elements.productImageData.value = product?.image || "";
  elements.productDialogTitle.textContent = product ? "Modifier le produit" : "Ajouter un produit";
  updatePhotoPreview();
  elements.productDialog.showModal();
  requestAnimationFrame(() => document.querySelector("#productName").focus());
}

function updatePhotoPreview() {
  const image = elements.productImageData.value;
  const icon = document.querySelector("#productIcon").value || "🧺";
  elements.photoPreview.innerHTML = image
    ? `<img src="${escapeHTML(image)}" alt="Aperçu du produit" />`
    : `<span aria-hidden="true">${escapeHTML(icon)}</span>`;
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
    quantity: Math.max(1, Number.parseInt(document.querySelector("#productQuantity").value, 10) || 1),
    icon: document.querySelector("#productIcon").value.trim() || "🧺",
    image: elements.productImageData.value,
    accent: existingProduct?.accent || CATEGORY_ACCENTS[getCategories().indexOf(category) % CATEGORY_ACCENTS.length] || CATEGORY_ACCENTS[0],
  };

  const nextProducts = existingProduct
    ? state.products.map((item) => (item.id === existingId ? product : item))
    : [...state.products, product];

  if (!saveJSON(STORAGE_KEYS.products, nextProducts)) return;
  state.products = nextProducts;
  elements.productDialog.close();
  render();
  showToast(existingProduct ? "Produit modifié" : "Produit ajouté");
}

function deleteProduct(product) {
  const confirmed = window.confirm(`Supprimer « ${product.name} » de vos références ?`);
  if (!confirmed) return;
  state.products = state.products.filter((item) => item.id !== product.id);
  state.needed.delete(product.id);
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
  const lines = ["Bonjour,", "", "Voici la liste de courses :", ""];
  Object.entries(groups).forEach(([category, items]) => {
    lines.push(category.toUpperCase());
    items.forEach((product) => {
      lines.push(`• ${product.quantity} × ${product.name} — ${referenceLine(product)}`);
    });
    lines.push("");
  });
  lines.push("Merci !");
  return lines.join("\n");
}

function prepareEmail() {
  if (!selectedProducts().length) return;
  const recipient = state.settings.email || "";
  const subject = state.settings.subject || "Ma liste de courses";
  const href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildListText())}`;
  window.location.href = href;
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

function openSettings() {
  elements.settingsEmail.value = state.settings.email || "";
  elements.settingsSubject.value = state.settings.subject || "Ma liste de courses";
  elements.settingsDialog.showModal();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxSide = 700;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

document.querySelector("#addProductButton").addEventListener("click", () => openProductDialog());
document.querySelector("#settingsButton").addEventListener("click", openSettings);
elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

elements.categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

elements.productGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-product-id]");
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!card || !action) return;
  const product = state.products.find((item) => item.id === card.dataset.productId);
  if (!product) return;
  if (action === "toggle") toggleNeeded(product.id);
  if (action === "edit") openProductDialog(product);
  if (action === "delete") deleteProduct(product);
});

elements.shoppingList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-list-id]");
  if (item && event.target.closest(".remove-list-item")) toggleNeeded(item.dataset.listId, false);
});

elements.emailListButton.addEventListener("click", prepareEmail);
elements.copyListButton.addEventListener("click", copyList);
elements.clearListButton.addEventListener("click", () => {
  if (!selectedProducts().length) return;
  if (!window.confirm("Décocher tous les produits de la liste ?")) return;
  state.needed.clear();
  persistNeeded();
  renderProducts();
  renderList();
  showToast("Liste vidée");
});

elements.productForm.addEventListener("submit", handleProductSubmit);
document.querySelector("#productIcon").addEventListener("input", updatePhotoPreview);
document.querySelector("#productImage").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    elements.productImageData.value = await compressImage(file);
    updatePhotoPreview();
  } catch {
    showToast("Impossible de lire cette image");
  }
});
document.querySelector("#removePhotoButton").addEventListener("click", () => {
  elements.productImageData.value = "";
  document.querySelector("#productImage").value = "";
  updatePhotoPreview();
});

elements.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.settings = {
    email: elements.settingsEmail.value.trim(),
    subject: elements.settingsSubject.value.trim() || "Ma liste de courses",
  };
  saveJSON(STORAGE_KEYS.settings, state.settings);
  elements.settingsDialog.close();
  showToast("Préférences enregistrées");
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeDialog}`).close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const isBackdrop =
      event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (isBackdrop) dialog.close();
  });
});

state.needed = new Set([...state.needed].filter((id) => state.products.some((product) => product.id === id)));
persistNeeded();
render();
