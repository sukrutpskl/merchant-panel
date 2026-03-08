import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { FormData, fileFromSync } from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';
const email = 'burger@nedubu.com.tr';

const baseDir = 'C:/Users/sukru/Downloads/yemek alt kategori/yemek alt kategori';
const imagesToUpload = [
    { name: 'Kebap_Local', filename: 'Kebap.png' },
    { name: 'Döner_Local', filename: 'Döner.png' },
    { name: 'Salata_Local', filename: 'Salata.png' },
    { name: 'Baklava_Local', filename: 'Baklava.png' },
    { name: 'Pizza_Local', filename: 'Pizza.png' },
    { name: 'Burger_Local', filename: 'Burger.png' },
    { name: 'Lahmacun_Local', filename: 'Pide & Lahmacun.png' },
    { name: 'Tatlı_Local', filename: 'Pasta & Tatlı.png' },
    { name: 'Köfte_Local', filename: 'Köfte.png' }
];

async function upload() {
    console.log('--- YEREL VARLIK YÜKLEME BAŞLATILDI ---');

    const loginRes = await fetch(`${API_BASE}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken;

    if (!token) {
        console.error('Login failed');
        return;
    }

    const mapping = {};

    for (const item of imagesToUpload) {
        const fullPath = path.join(baseDir, item.filename);
        if (!fs.existsSync(fullPath)) {
            console.error(`[!] Dosya bulunamadı: ${fullPath}`);
            continue;
        }

        const formData = new FormData();
        const file = fileFromSync(fullPath, 'image/png');
        formData.append('files', file, item.filename);

        const res = await fetch(`${API_BASE}/api/files/upload-multiple`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        if (data.success && data.data?.[0]) {
            mapping[item.name] = data.data[0];
            console.log(`[OK] ${item.name} -> ${data.data[0]}`);
        } else {
            console.error(`[X] ${item.name} yüklenemedi:`, data);
        }
    }

    console.log('\n--- YEREL GÖRSEL MAPPING (Kopyalayın) ---');
    console.log(JSON.stringify(mapping, null, 2));
}

upload();
