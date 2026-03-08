import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { FormData, fileFromSync } from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';
const email = 'burger@nedubu.com.tr';

const imagesToUpload = [
    { name: 'Margarita', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/premium_margarita_pizza_fresh_basil_1772975388039.png' },
    { name: 'Pepperoni', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/luxury_pepperoni_pizza_cheese_pull_commercial_1772975406202.png' },
    { name: 'Karışık Pizza', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/gourmet_mixed_pizza_full_toppings_shot_8k_1772975419859.png' }
];

async function upload() {
    console.log('--- PIZZA GÖRSEL YÜKLEME BAŞLATILDI ---');

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

    console.log('\n--- PIZZA GÖRSEL MAPPING (Kopyalayın) ---');
    console.log(JSON.stringify(mapping, null, 2));
}

upload();
