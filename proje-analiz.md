# Merchant Panel - Proje Analizi

Mevcut kod yapısına (`src/` içerisindeki sayfalar ve API entegrasyonlarına) göre sistemde nelerin tam olarak çalışıp nelerin henüz eksik veya yetersiz olduğuna dair genel analiz aşağıdadır:

## ✅ Neler Yapabiliyoruz? (Mevcut ve Çalışan Özellikler)

1. **Kimlik Doğrulama (Auth)**
   - E-posta/Telefon ve şifre ile sisteme giriş yapabilme (Login).
   - Token tabanlı oturum yönetimi ve süresi dolan yetki belgeleri için periyodik "Refresh Token" yenileme mekanizması.
   - Güvenli çıkış yapabilme (Logout).

2. **Dashboard (Genel Bakış)**
   - Mağazanın genel özet verilerini görüntüleme (Toplam Sipariş, Toplam Gelir, Bekleyen Siparişler, Toplam Ürün).
   - Son 5 siparişin hızlı listesini ve güncel durumlarını görebilme.
   - API tarafında özet veri (Dashboard Stats) alınamaması durumunda, sistemin siparişler üzerinden bu veriyi toplaması (Fallback mekanizması).

3. **Sipariş Yönetimi (Orders)**
   - Mağazaya ait tüm siparişleri listeleme.
   - Siparişleri durumlarına göre filtreleme (Beklemede, Onaylandı, Hazırlanıyor, Hazır, Yolda, Teslim Edildi, İptal).
   - Sipariş detaylarını (alınan ürünler, fiyatlandırma, indirimler, kullanıcı adres ve notu) görüntüleyebilme.
   - Sipariş durumunu güncelleyebilme (örn. "Beklemede"den "Hazırlanıyor"a alma).

4. **Ürün Yönetimi (Products)**
   - Ürünleri listeleme, sayfalandırma, ürün adı ile arama yapma ve kategoriye göre filtreleme.
   - **Yeni ürün ekleme:** İsim, açıklama, kategori, fiyat bilgileri ile donatıp görsel (dosya yükleyerek veya link vererek) ekleyebilme.
   - Ürünleri aktif/pasif duruma getirebilme.

5. **Stok / Durum Yönetimi (Stock)**
   - Ürünlerin aktiflik/pasiflik (satışa açık/kapalı) durumunu izleme.
   - Çoklu (Bulk) işlem: Seçili kategorideki veya aramadaki ürünlerin "Tümünü Aktif Yap" veya "Tümünü Pasif Yap" diyerek topluca durumunu değiştirebilme.

---

## ❌ Neler Yapamıyoruz? (Eksikler ve Geliştirilmesi Gerekenler)

1. **Kategori Yönetimi Arayüzü Yok**
   - API dosyasında kategori oluşturma (`createCategory`) ve silme (`deleteCategory`) istekleri tanımlı olsa da, panelde bu işlemleri yapabileceğimiz bir **Kategoriler sayfası yok**. Sadece ürün eklerken var olan kategorileri listeden seçebiliyoruz. Kategori ekleme/düzenleme menüsü yapılması gerekiyor.

2. **Ürün Düzenleme ve Silme İşlemleri Eksik**
   - Yeni ürün ekleyebiliyoruz ancak **mevcut bir ürünü düzenleme** (fiyatını, adını veya açıklamasını değiştirme) ve bir ürünü tamamen **silme** fonksiyonu / arayüzü bulunmuyor. Şu an sadece ürünü pasife alarak gizleyebiliyoruz.

3. **Gerçek Stok (Miktar) Takibi Yok**
   - "Stok Yönetimi" sayfasında sadece ürünün "Satışta (Aktif)" veya "Satışa Kapalı (Pasif)" olma durumu kontrol ediliyor. Ürünlerin "adet" bazında (örn. 50 adet kaldı) sayısal stok takibi yapılmıyor.

4. **Mağaza (Merchant) Ayarları Değiştirilemiyor**
   - Mağaza adını, logosunu ve statüsünü görüntüleyebiliyoruz ancak çalışma saatlerini değiştirme, mağazayı acil durumlarda "Kapalı" konumuna alma veya profil bilgilerini güncellemek için bir **Ayarlar sayfası** bulunmuyor.

5. **Raporlama Arayüzü Eksik**
   - `api.js` içerisinde satış raporlarını çekmek için `getSalesReport` metodu yazılmış, ancak bu veriyi gösterecek, tarih aralığı seçtirip grafik/tablo sunacak bir **Raporlar sekmesi eklenmemiş**.

6. **Gelişmiş Sipariş İşlemleri**
   - Sipariş iade (Refund) süreci için özel bir arayüz veya detaylı varyasyon/ek-malzeme (option groups) yönetimi için tam gelişmiş bir düzenleme modülü şu an UI tarafında bulunmamakta.

---

**Özetle:**
Sistem, siparişleri karşılamak, durumlarını değiştirmek ve temel (yeni) ürünleri içeriye aktarmak için yeterli bir MVP (Minimum Viable Product) düzeyinde. Ancak ürün/kategori bilgilerini sonradan güncellemek (Edit/Delete) ve işin raporlama/ayarlar kısmını yönetmek adına eksik sayfalara (Kategori Yönetimi, Raporlar, Profil Ayarları) acilen ihtiyaç duymaktadır.
