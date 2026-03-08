import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { FormData, fileFromSync } from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';
const email = 'burger@nedubu.com.tr';

const baseDir = 'C:/Users/sukru/Downloads/yemek alt kategori/yemek alt kategori';
const imagesToUpload = [
    { name: 'Dondurma_Local', filename: 'Dondurma.png' }
];

async function upload() {
    const loginRes = await fetch(`${API_BASE}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken;

    if (!token) return;

    for (const item of imagesToUpload) {
        const fullPath = path.join(baseDir, item.filename);
        const formData = new FormData();
        const file = fileFromSync(fullPath, 'image/png');
        formData.append('files', file, item.filename);

        const res = await fetch(`${API_BASE}/api/files/upload-multiple`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        if (data.success) {
            console.log(`${item.name}: ${data.data[0]}`);
        }
    }
}

upload();
