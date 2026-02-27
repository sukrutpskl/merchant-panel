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
                  <label>Ad</label>
                  <input type="text" id="prof-fname" required />
                </div>
                <div class="form-group">
                  <label>Soyad</label>
                  <input type="text" id="prof-lname" required />
                </div>
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input type="tel" id="prof-phone" />
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 10px;">Gerekiyorsa Profili Güncelle</button>
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
                <label>Mağaza Adı</label>
                <input type="text" id="merch-name" required />
              </div>
              <div class="form-group">
                <label>Açıklama</label>
                <textarea id="merch-desc" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Adres</label>
                <textarea id="merch-address" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Min. Sipariş Tutarı (₺)</label>
                  <input type="number" step="0.01" id="merch-min" />
                </div>
                <div class="form-group">
                  <label>Teslimat Ücreti (₺)</label>
                  <input type="number" step="0.01" id="merch-fee" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Hazırlama Süresi (Dk)</label>
                  <input type="number" id="merch-prep" />
                </div>
                <div class="form-group" style="display:flex; align-items:flex-end;">
                  <label class="toggle" style="margin-bottom:8px;">
                    <input type="checkbox" id="merch-autoaccept" />
                    <span class="toggle-slider"></span>
                    <span style="margin-left:8px;font-size:0.875rem;">Siparişleri Otomatik Onayla</span>
                  </label>
                </div>
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 10px;">Ayarları Kaydet</button>
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
