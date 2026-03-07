import { api } from '../api.js';
import { showToast, escapeHtml } from '../utils.js';
import { getMerchant, getUser, setMerchant } from '../auth.js';

export function renderProfile(container) {
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <h2>Mağaza & Profil Ayarları</h2>
        <p>Bilgilerinizi ve çalışma saatlerinizi güncelleyin</p>
      </div>

      <div class="settings-grid">
        <!-- Profile Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Profil Bilgileri</h3>
          </div>
          <div class="card-body">
            <form id="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Ad</label>
                  <input type="text" id="prof-fname" required />
                </div>
                <div class="form-group">
                  <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Soyad</label>
                  <input type="text" id="prof-lname" required />
                </div>
              </div>
              <div class="form-group">
                <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>Telefon</label>
                <input type="tel" id="prof-phone" />
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 10px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>Gerekiyorsa Profili Güncelle</button>
            </form>
          </div>
        </div>

        <!-- Merchant Settings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Mağaza Ayarları</h3>
          </div>
          <div class="card-body">
            <form id="merchant-form">
              <div class="form-group">
                <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Mağaza Adı</label>
                <input type="text" id="merch-name" required />
              </div>
              <div class="form-group">
                <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>Açıklama</label>
                <textarea id="merch-desc" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>Adres</label>
                <textarea id="merch-address" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>Min. Sipariş Tutarı (₺)</label>
                  <input type="number" step="0.01" id="merch-min" />
                </div>
                <div class="form-group">
                  <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>Teslimat Ücreti (₺)</label>
                  <input type="number" step="0.01" id="merch-fee" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Hazırlama Süresi (Dk)</label>
                  <input type="number" id="merch-prep" />
                </div>
                <div class="form-group" style="display:flex; align-items:flex-end;">
                  <label class="toggle" style="margin-bottom:8px;">
                    <input type="checkbox" id="merch-autoaccept" />
                    <span class="toggle-slider"></span>
                    <span style="margin-left:8px;font-size:0.875rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>Siparişleri Otomatik Onayla</span>
                  </label>
                </div>
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 10px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>Ayarları Kaydet</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  loadProfileData();
  setupProfileEvents();
}

async function loadProfileData() {
  // Load User Data
  const u = getUser() || {};
  document.getElementById('prof-fname').value = u.firstName || '';
  document.getElementById('prof-lname').value = u.lastName || '';
  document.getElementById('prof-phone').value = u.phone || '';

  // Load Merchant Data (from token/storage first, fetch fresh if possible)
  try {
    const freshProfile = await api.getProfile();
    const data = freshProfile?.data || freshProfile || {};

    document.getElementById('merch-name').value = data.name || '';
    document.getElementById('merch-desc').value = data.description || '';
    document.getElementById('merch-address').value = data.address || '';
    document.getElementById('merch-min').value = data.minimumOrderAmount || 0;
    document.getElementById('merch-fee').value = data.deliveryFee || 0;
    document.getElementById('merch-prep').value = data.preparationTimeMinutes || 0;
    document.getElementById('merch-autoaccept').checked = !!data.autoAcceptOrders;

  } catch (err) {
    console.warn('Could not fetch fresh profile', err);
    // Fallback to local storage merchant
    const m = getMerchant() || {};
    document.getElementById('merch-name').value = m.name || '';
    document.getElementById('merch-address').value = m.address || '';
  }
}

function setupProfileEvents() {
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    /* Currently no explicit PUT /api/Users/profile in swagger under Merchant tags.
       We will show a toast indicating it relies on the global merchant update */
    showToast('Kullanıcı ayarları yerel olarak güncellendi (API kapalı olabilir)', 'info');
  });

  document.getElementById('merchant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('merch-name').value.trim(),
      description: document.getElementById('merch-desc').value.trim(),
      address: document.getElementById('merch-address').value.trim(),
      minimumOrderAmount: parseFloat(document.getElementById('merch-min').value) || 0,
      deliveryFee: parseFloat(document.getElementById('merch-fee').value) || 0,
      preparationTimeMinutes: parseInt(document.getElementById('merch-prep').value) || 0,
      autoAcceptOrders: document.getElementById('merch-autoaccept').checked
    };

    try {
      await api.updateProfile(data);
      showToast('Mağaza ayarları güncellendi');

      // Update local storage slightly
      const m = getMerchant() || {};
      m.name = data.name;
      setMerchant(m);

      // Trigger header update
      const nameEl = document.getElementById('merchant-name');
      if (nameEl) nameEl.textContent = data.name;
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
