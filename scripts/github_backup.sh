#!/bin/bash

# Cloudflare Tunnel Yeniden Başlama Adımları eklendi.
# Cron ayarı ve git işlemleri eklendi.

PROJECT_DIR="/home/ubuntu/projects/merchant-panel"

cd $PROJECT_DIR

# Eğer git klasörü yoksa projeyi initialize et
if [ ! -d ".git" ]; then
  git init
  # Geçici commit bilgileri (Kullanıcı yapılandırmadıysa)
  git config user.email "auto-backup@nedunet.local"
  git config user.name "Auto Backup Bot"
fi

# Tüm değişiklikleri ekle ve commit at
git add .
git commit -m "Auto backup: $(date +'%Y-%m-%d %H:%M:%S')"

# Uzak sunucu (origin) varsa push at (main branchine zorla)
if git remote | grep -q 'origin'; then
  # Mevcut değişiklikleri pushla (Eğer auth istenecekse manuel bir defalığına yapılmalı)
  git push -u origin main
else
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Remote repository (origin) ayarlanmamış, sadece local commit atıldı." >> /home/ubuntu/projects/backup_cron.log
fi
