import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { FormData, fileFromSync } from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';
const email = 'burger@nedubu.com.tr';

const imagesToUpload = [
    { name: 'Saç Kremi', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/premium_hair_conditioner_bottle_1772974445084.png' },
    { name: 'Diş Fırçası', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/modern_toothbrush_design_1772974459470.png' },
    { name: 'Deodorant', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/luxury_deodorant_spray_can_1772974475069.png' },
    { name: 'Besleyici Şampuan', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/luxury_hair_shampoo_bottle_1772974489998.png' },
    { name: 'Bakım Yağı', path: 'C:/Users/sukru/.gemini/antigravity/brain/9d8e3b36-e2de-410b-81f5-51c5fde16716/premium_hair_oil_dropper_bottle_1772974503538.png' }
];

async function upload() {
    console.log('--- GÖRSEL YÜKLEME BAŞLATILDI ---');

    // Login to get token
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

    console.log('\n--- GÖRSEL MAPPING (Kopyalayın) ---');
    console.log(JSON.stringify(mapping, null, 2));
}

upload();
