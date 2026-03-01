---
description: Start Cloudflare Tunnels for NeduNet API and Merchant Panel
---

# Cloudflare Tunnel Başlatma ve Hata Çözümü Workflow'u

Kullanıcı "Cloudflare tunnel aç", "Tüneli yeniden başlat" veya "Swagger linki lazım" gibi bir komut verdiğinde aşağıdaki adımları sırasıyla uygula:

1. **Eski Tünelleri Temizle:**
// turbo

```bash
pkill cloudflared
```

1. **Vite (Frontend) Konfigürasyonunu Kontrol Et:**
Merchant-panel içerisindeki `vite.config.js` dosyasında `allowedHosts: true` değerinin bulunduğundan emin ol. Bulunmuyorsa ekle. Aksi halde frontend tünelinde hata alınır. Başarıyla eklediysen Vite'i yeniden başlatmak için `pkill -f "vite"` ve `nohup npm run dev -- --host > npm_dev.log 2>&1 &` komutlarını kullan.

2. **Backend ve Frontend için Yeni Tünelleri Başlat:**
// turbo-all

```bash
cd /home/ubuntu/projects
nohup cloudflared tunnel --url http://localhost:8080 > /home/ubuntu/projects/api_tunnel.log 2>&1 &
nohup cloudflared tunnel --url http://localhost:5173 > /home/ubuntu/projects/ui_tunnel.log 2>&1 &
```

1. **Tünellerin Oluşması İçin Bekle:**

```bash
sleep 6
```

1. **Yeni Linkleri Çıkar:**

```bash
API_URL=$(cat /home/ubuntu/projects/api_tunnel.log | grep -a -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' | tail -1)
UI_URL=$(cat /home/ubuntu/projects/ui_tunnel.log | grep -a -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' | tail -1)
echo "API: $API_URL"
echo "FRONTEND: $UI_URL"
```

1. **Kullanıcıya Bilgi Ver:**
Kullanıcıya hem `Merchant Panel` (Frontend) linkini (örn: `$UI_URL`) hem de Swagger dokümantasyonu için Backend API linkine `/swagger/index.html` ekleyerek (örn: `$API_URL/swagger/index.html`) ilet.

2. **Monitör Scriptini Hatırlat:**
Ayrıca `/home/ubuntu/projects/monitor_tunnels.sh` dosyasında, arka planda bağlantıları dinleyen bir otomatik başlatıcı (monitoring) script'i bulunduğunu ve güncel bağlantıları `/home/ubuntu/Desktop/AKTIF_LINKLER.txt` adresinden görebileceklerini belirt.
