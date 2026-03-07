import { api } from '../api.js';
import { showToast, escapeHtml } from '../utils.js';

let categories = [];
let editCategoryId = null;

export function renderCategories(container) {
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div class="page-header-actions">
          <div>
            <h2>Kategoriler</h2>
            <p>Mağaza kategorilerini yönetin</p>
          </div>
          <button class="btn btn-primary" id="add-category-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yeni Kategori
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper" id="categories-table">
          <div style="padding: 20px;">
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div class="modal-overlay" id="category-modal">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title" id="cat-modal-title">Yeni Kategori Ekle</h3>
          <button class="modal-close" id="cat-modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <form id="category-form">
            <div class="form-group">
              <label for="c-name">Kategori Adı *</label>
              <input type="text" id="c-name" required placeholder="Örn: İçecekler" />
            </div>
            <div class="form-group">
              <label for="c-parent">Üst Kategori</label>
              <select id="c-parent">
                <option value="">Ana Kategori (Yok)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="c-desc">Açıklama</label>
              <textarea id="c-desc" rows="3" placeholder="İsteğe bağlı açıklama"></textarea>
            </div>
            <div class="form-group">
              <label for="c-image">Kategori Görseli URL *</label>
              <input type="url" id="c-image" required placeholder="https://example.com/image.jpg" />
            </div>
            <div class="form-group">
              <label for="c-order">Sıra (Display Order)</label>
              <input type="number" id="c-order" value="0" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cat-modal-cancel">İptal</button>
          <button class="btn btn-primary" id="cat-modal-save">Kaydet</button>
        </div>
      </div>
    </div>
  `;

  setupCategoryEvents();
  loadCategories();
}

function setupCategoryEvents() {
  document.getElementById('add-category-btn').addEventListener('click', () => {
    editCategoryId = null;
    document.getElementById('cat-modal-title').textContent = 'Yeni Kategori Ekle';
    document.getElementById('category-form').reset();
    document.getElementById('category-modal').classList.add('active');
  });

  const closeModal = () => document.getElementById('category-modal').classList.remove('active');
  document.getElementById('cat-modal-close').addEventListener('click', closeModal);
  document.getElementById('cat-modal-cancel').addEventListener('click', closeModal);

  document.getElementById('category-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.getElementById('cat-modal-save').addEventListener('click', async () => {
    const name = document.getElementById('c-name').value.trim();
    const description = document.getElementById('c-desc').value.trim();
    const imageUrl = document.getElementById('c-image').value.trim();
    const displayOrder = parseInt(document.getElementById('c-order').value) || 0;
    const parentCategoryId = document.getElementById('c-parent').value || null;

    if (!name || !imageUrl) {
      showToast('Kategori adı ve görsel URL zorunludur', 'error');
      return;
    }

    try {
      if (editCategoryId) {
        await api.updateCategory(editCategoryId, { name, description, imageUrl, displayOrder, parentCategoryId });
        showToast('Kategori başarıyla güncellendi');
      } else {
        await api.createCategory({ name, description, imageUrl, displayOrder, parentCategoryId });
        showToast('Kategori başarıyla eklendi');
      }
      closeModal();
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function loadCategories() {
  try {
    const res = await api.getCategories();
    categories = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    renderCategoryTable();
  } catch (err) {
    document.getElementById('categories-table').innerHTML = `
      <div class="empty-state">
        <p>Kategoriler yüklenemedi</p>
        <small>${escapeHtml(err.message)}</small>
      </div>
    `;
  }
}

function renderCategoryTable() {
  const el = document.getElementById('categories-table');
  if (!categories.length) {
    el.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        <p>Henüz kategori eklenmemiş</p>
      </div>
    `;
    return;
  }

  // Populate Parent Category Dropdown
  const parentSelect = document.getElementById('c-parent');
  if (parentSelect) {
    // Only show top-level categories as potential parents to avoid deep nesting confusion if any
    const mainCategories = categories.filter(c => !c.parentCategoryId);
    parentSelect.innerHTML = '<option value="">Ana Kategori (Yok)</option>' +
      mainCategories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  }

  // Process categories into a flat list with depth for rendering
  const categoryTree = [];
  const mainCats = categories.filter(c => !c.parentCategoryId).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  mainCats.forEach(mainCat => {
    categoryTree.push({ ...mainCat, depth: 0 });
    const subCats = categories.filter(c => c.parentCategoryId === mainCat.id).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    subCats.forEach(sub => {
      categoryTree.push({ ...sub, depth: 1 });
    });
  });

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Sıra</th>
          <th>Kategori Adı</th>
          <th>Açıklama</th>
          <th>İşlem</th>
        </tr>
      </thead>
      <tbody>
        ${categoryTree.map(c => `
          <tr>
            <td style="width:80px;">${c.displayOrder || 0}</td>
            <td style="padding-left: ${c.depth === 1 ? '32px' : '16px'};">
                ${c.depth === 1 ? '<span style="color:var(--text-muted);margin-right:8px;">↳</span>' : ''}
                <strong>${escapeHtml(c.name)}</strong>
            </td>
            <td>${escapeHtml(c.description || '-')}</td>
            <td style="width:140px; display:flex; gap:8px;">
              <button class="btn btn-sm btn-secondary edit-cat-btn" data-id="${c.id}">Düzenle</button>
              <button class="btn btn-sm btn-danger delete-cat-btn" data-id="${c.id}">Sil</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Delete events
  el.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
      const id = e.target.dataset.id;
      try {
        await api.deleteCategory(id);
        showToast('Kategori silindi');
        loadCategories();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Edit events
  el.querySelectorAll('.edit-cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const cat = categories.find(c => c.id === id);
      if (!cat) return;

      editCategoryId = id;
      document.getElementById('cat-modal-title').textContent = 'Kategoriyi Düzenle';
      document.getElementById('c-name').value = cat.name || '';
      document.getElementById('c-parent').value = cat.parentCategoryId || '';
      document.getElementById('c-desc').value = cat.description || '';
      document.getElementById('c-image').value = cat.imageUrl || '';
      document.getElementById('c-order').value = cat.displayOrder || 0;

      document.getElementById('category-modal').classList.add('active');
    });
  });
}
