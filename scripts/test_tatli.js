import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';

async function test() {
    console.log('Testing login for tatli@nedubu.com.tr...');
    try {
        const res = await fetch(`${API_BASE}/api/merchant/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneOrEmail: 'tatli@nedubu.com.tr', password: 'Deneme123' })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
