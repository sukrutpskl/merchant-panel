import { api } from '../api.js';
import { formatCurrency, showToast, debounce, escapeHtml, placeholderSvg } from '../utils.js';

let categories = [];
let currentPage = 1;

export function renderProducts(container) {
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div class="page-header-actions">
          <div>
            <h2>Ürünler</h2>
            <p>Ürünlerinizi yönetin</p>
          </div>
          <button class="btn btn-primary" id="add-product-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yeni Ürün
          </button>
        </div>
      </div>

      <div class="search-bar" style="margin-bottom: 24px;">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="product-search" placeholder="Ürün ara..." />
        </div>
        <select class="filter-select" id="category-filter">
          <option value="">Tüm Kategoriler</option>
        </select>
      </div>

      <div id="products-container">
        <div class="product-grid">
          ${Array(6).fill('<div class="product-card skeleton skeleton-card"></div>').join('')}
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div class="modal-overlay" id="product-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">Yeni Ürün Ekle</h3>
          <button class="modal-close" id="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <form id="product-form">
            <div class="form-group">
              <label for="p-name">Ürün Adı *</label>
              <input type="text" id="p-name" required placeholder="Ürün adını girin" />
            </div>
            <div class="form-group">
              <label for="p-desc">Açıklama</label>
              <textarea id="p-desc" rows="3" placeholder="Ürün açıklaması"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="p-price">Fiyat (₺) *</label>
                <input type="number" id="p-price" step="0.01" min="0" required placeholder="0.00" />
              </div>
              <div class="form-group">
                <label for="p-category">Kategori *</label>
                <select id="p-category" required>
                  <option value="">Kategori seçin</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="p-image">Görsel URL</label>
              <input type="text" id="p-image" placeholder="https://..." />
            </div>
            <div class="form-group">
              <label>Veya Dosya Yükle</label>
              <input type="file" id="p-file" accept="image/*" style="padding: 8px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); width: 100%; color: var(--text-secondary);" />
            </div>
            <div id="image-preview" style="margin-bottom: 16px;"></div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel">İptal</button>
          <button class="btn btn-primary" id="modal-save">
            <span id="modal-save-text">Kaydet</span>
            <span id="modal-save-loader" class="hidden"><svg class="spinner" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" dur="1s" from="0 12 12" to="360 12 12" repeatCount="indefinite"/></circle></svg></span>
          </button>
        </div>
      </div>
    </div>
  `;

  setupProductEvents();
  loadCategories();
  loadProducts();
}

function setupProductEvents() {
  // Add product button
  document.getElementById('add-product-btn').addEventListener('click', () => {
    openModal();
  });

  // Modal close/cancel
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('product-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Save product
  document.getElementById('modal-save').addEventListener('click', saveProduct);

  // Search
  document.getElementById('product-search').addEventListener('input', debounce((e) => {
    currentPage = 1;
    loadProducts();
  }, 400));

  // Category filter
  document.getElementById('category-filter').addEventListener('change', () => {
    currentPage = 1;
    loadProducts();
  });

  // File upload preview
  document.getElementById('p-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('image-preview').innerHTML = `
          <img src="${ev.target.result}" style="max-width: 100%; max-height: 150px; border-radius: var(--radius-sm); object-fit: cover;" />
        `;
      };
      reader.readAsDataURL(file);
    }
  });
}

function openModal() {
  document.getElementById('product-form').reset();
  document.getElementById('image-preview').innerHTML = '';
  // Process categories into hierarchy
  const hierarchy = formatCategoryHierarchy(categories);

  // Populate category dropdown
  const select = document.getElementById('p-category');
  select.innerHTML = '<option value="">Kategori seçin</option>' +
    hierarchy.map(c => `<option value="${c.id}">${escapeHtml(c.displayName)}</option>`).join('');
  document.getElementById('product-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('active');
}

async function loadCategories() {
  try {
    const res = await api.getCategories();
    console.log('Categories API response:', res);
    // Handle both {data: [...]} and direct array response
    categories = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    console.log('Parsed categories:', categories);

    // Process categories into hierarchy
    const hierarchy = formatCategoryHierarchy(categories);

    const filterSelect = document.getElementById('category-filter');
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">Tüm Kategoriler</option>' +
        hierarchy.map(c => `<option value="${c.id}">${escapeHtml(c.displayName)}</option>`).join('');
    }
  } catch (err) {
    console.error('Categories error:', err);
    showToast('Kategoriler yüklenemedi: ' + err.message, 'error');
  }
}

// Helper function to process categories into a formatted flat list for dropdowns
function formatCategoryHierarchy(cats) {
  const tree = [];
  const mainCats = cats.filter(c => !c.parentCategoryId).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  mainCats.forEach(mainCat => {
    tree.push({ ...mainCat, displayName: mainCat.name });
    const subCats = cats.filter(c => c.parentCategoryId === mainCat.id).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    subCats.forEach(sub => {
      tree.push({ ...sub, displayName: `${mainCat.name} > ${sub.name}` });
    });
  });

  return tree;
}

async function loadProducts() {
  const search = document.getElementById('product-search')?.value || '';
  const categoryId = document.getElementById('category-filter')?.value || '';
  const container = document.getElementById('products-container');

  try {
    const res = await api.getProducts({ search, categoryId, page: currentPage, pageSize: 20 });
    console.log('Products API response:', res);
    const products = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    renderProductGrid(container, products);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Ürünler yüklenemedi</p>
        <small>${escapeHtml(err.message)}</small>
      </div>
    `;
  }
}

function renderProductGrid(container, products) {
  if (!products.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <p>Henüz ürün eklenmemiş</p>
        <small>"Yeni Ürün" butonuna tıklayarak ekleyin</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="product-grid">
      ${products.map(p => `
        <div class="product-card">
          <div class="product-image">
            ${p.imageUrl
      ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" onerror="this.parentElement.innerHTML='${placeholderSvg()}'"/>`
      : placeholderSvg()}
          </div>
          <div class="product-body">
            <div class="product-name">${escapeHtml(p.name)}</div>
            <div class="product-desc">${escapeHtml(p.description) || 'Açıklama yok'}</div>
            <div class="product-footer">
              <span class="product-price">${formatCurrency(p.price)}</span>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge ${p.isAvailable ? 'badge-available' : 'badge-unavailable'}">${p.isAvailable ? 'Aktif' : 'Pasif'}</span>
                <label class="toggle" title="${p.isAvailable ? 'Pasif yap' : 'Aktif yap'}">
                  <input type="checkbox" ${p.isAvailable ? 'checked' : ''} data-product-id="${p.id}" class="availability-toggle" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <button class="btn btn-sm btn-secondary" disabled title="API tarafından desteklenmiyor" style="flex:1; opacity:0.6; cursor:not-allowed;">Düzenle</button>
              <button class="btn btn-sm btn-danger" disabled title="API tarafından desteklenmiyor" style="flex:1; opacity:0.6; cursor:not-allowed;">Sil</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Availability toggles
  container.querySelectorAll('.availability-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const id = e.target.dataset.productId;
      const isAvailable = e.target.checked;
      try {
        await api.updateProductAvailability(id, isAvailable);
        showToast(isAvailable ? 'Ürün aktif edildi' : 'Ürün pasif edildi');
        loadProducts();
      } catch (err) {
        showToast(err.message, 'error');
        e.target.checked = !isAvailable;
      }
    });
  });
}

async function saveProduct() {
  const name = document.getElementById('p-name').value.trim();
  const description = document.getElementById('p-desc').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  const categoryId = document.getElementById('p-category').value;
  const imageUrl = document.getElementById('p-image').value.trim();
  const fileInput = document.getElementById('p-file');

  if (!name || isNaN(price) || !categoryId) {
    showToast('Lütfen zorunlu alanları doldurun', 'error');
    return;
  }

  const saveText = document.getElementById('modal-save-text');
  const saveLoader = document.getElementById('modal-save-loader');
  saveText.classList.add('hidden');
  saveLoader.classList.remove('hidden');

  try {
    let finalImageUrl = imageUrl;

    // Upload file if selected
    if (fileInput.files.length > 0) {
      try {
        const uploadRes = await api.uploadFile(fileInput.files[0]);
        if (uploadRes.success && uploadRes.data) {
          finalImageUrl = uploadRes.data;
        }
      } catch (err) {
        console.warn('File upload failed:', err);
      }
    }

    const productData = {
      name,
      description: description || '',
      price,
      categoryId,
      imageUrl: finalImageUrl || '',
      variants: [],
      optionGroups: [],
    };

    await api.createProduct(productData);
    showToast('Ürün başarıyla eklendi');
    closeModal();
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saveText.classList.remove('hidden');
    saveLoader.classList.add('hidden');
  }
}
