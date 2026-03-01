# Cloudflare Tunnel Yeniden Başlatma Mantığı

Sunucu yeniden başlarsa veya tünel kapanırsa NeduNet API ve Frontend'i dışarı açmak için aşağıdaki adımlar uygulanır:

1. **NeduNet API (Backend - Port 8080) için Tünel Açma:**
   ```bash
   nohup cloudflared tunnel --url http://localhost:8080 > /home/ubuntu/projects/api_tunnel.log 2>&1 &
   ```
   - Yukarıdaki komut çalıştırılır.
   - Ardından `cat /home/ubuntu/projects/api_tunnel.log` komutuyla log dosyasının içindeki `trycloudflare.com` uzantılı yeni oluşturulmuş link bulunur ve kullanıcıya iletilir.
   - Uygulamanın çalışıp çalışmadığını test etmek için bu linkin sonuna `/health` eklenerek (Örn: `https://...trycloudflare.com/health`) "Healthy" yazıp yazmadığı kontrol edilir.

2. **Merchant Panel (Frontend - Port 5173) Çalıştırılması:**
   ```bash
   cd /home/ubuntu/projects/merchant-panel
   nohup npm run dev > /home/ubuntu/projects/vite.log 2>&1 &
   ```
   Gerekirse bu port da dışarıya Cloudflare tüneli ile benzer şekilde açılabilir.
