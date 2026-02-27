import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const email = `test${Math.floor(Math.random() * 10000)}@merchant.com`;
const password = 'Password123!';

async function request(path, options = {}, token = null) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: response.status, data };
}

async function run() {
  console.log('Registering...', email);
  let res = await request('/api/Auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Merchant',
      email: email,
      phone: '555' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
      password: password,
      role: 2 // Trying to guess if we can set role?
    })
  });
  console.log('Register Res:', res.status, res.data);

  // Even if error, try to login (might already exist)
  console.log('Logging in...');
  res = await request('/api/Auth/login', { // Note: Auth/login vs merchant/auth/login
    method: 'POST',
    body: JSON.stringify({ phoneOrEmail: email, password: password })
  });
  console.log('Login Res:', res.status, res.data);

  if (res.status === 200 && res.data.success) {
      const token = res.data.data.accessToken;
      console.log('Got token, creating merchant profile...');
      const createRes = await request('/api/Merchants', {
          method: 'POST',
          body: JSON.stringify({
              name: 'Test Mağazası 2',
              description: 'My new merchant profile',
              phone: '5551234567',
              address: 'A random address',
              minimumOrderAmount: 10,
              deliveryFee: 5,
              autoAcceptOrders: true,
              preparationTimeMinutes: 20
          })
      }, token);
      console.log('Create Merchant:', createRes.status, createRes.data);
      
      console.log('Trying Merchant Login Now...');
      const merchLogin = await request('/api/merchant/auth/login', {
          method: 'POST',
          body: JSON.stringify({ phoneOrEmail: email, password })
      });
      console.log('Merchant Login Res:', merchLogin.status, merchLogin.data);
  }
}

run().catch(console.error);
