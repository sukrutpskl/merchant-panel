import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { FormData, fileFromSync } from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';
const email = 'burger@nedubu.com.tr';

const imagesToUpload = [
    { name: 'Mat Ruj', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/luxury_matte_lipstick_open_1772974899391.png' },
    { name: 'Fondöten', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/premium_foundation_bottle_liquid_1772974913943.png' },
    { name: 'Eyeliner', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/professional_eyeliner_brush_stroke_1772974928811.png' },
    { name: 'Maskara', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/volumizing_mascara_wand_swish_1772974945231.png' },
    { name: 'Nemlendirici Krem', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/luxury_face_moisturizer_jar_open_1772974959168.png' },
    { name: 'EDP Kadın Parfümü', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/premium_perfume_bottle_fragrance_spray_1772974977406.png' },
    { name: 'Yüz Temizleme Jeli', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/premium_face_wash_gel_bottle_1772974999804.png' },
    { name: 'Güneş Kremi', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/luxury_sunscreen_tube_beach_sand_1772975016772.png' },
    { name: 'EDT Erkek Parfümü', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/luxury_men_perfume_bottle_dark_marble_1772975030538.png' }
];

async function upload() {
    console.log('--- GÖRSEL YÜKLEME V2 BAŞLATILDI ---');

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
        if (!fs.existsSync(item.path)) {
            console.error(`[!] Dosya bulunamadı: ${item.path}`);
            continue;
        }

        const formData = new FormData();
        const file = fileFromSync(item.path, 'image/png');
        formData.append('files', file, path.basename(item.path));

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

    console.log('\n--- GÖRSEL MAPPING V2 (Kopyalayın) ---');
    console.log(JSON.stringify(mapping, null, 2));
}

upload();
