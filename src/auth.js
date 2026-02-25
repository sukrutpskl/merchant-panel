/**
 * Auth state management
 */

const STORAGE_KEYS = {
    TOKEN: 'merchant_access_token',
    REFRESH: 'merchant_refresh_token',
    EXPIRES: 'merchant_token_expires',
    MERCHANT: 'merchant_data',
    USER: 'merchant_user_data',
};

export function getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH);
}

export function setTokens(accessToken, refreshToken, expiresAt) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH, refreshToken);
    if (expiresAt) localStorage.setItem(STORAGE_KEYS.EXPIRES, expiresAt);
}

export function getMerchant() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.MERCHANT);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function setMerchant(merchant) {
    localStorage.setItem(STORAGE_KEYS.MERCHANT, JSON.stringify(merchant));
}

export function getUser() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.USER);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function isAuthenticated() {
    return !!getToken();
}

export function clearAuth() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

export function saveAuthResponse(authData) {
    setTokens(authData.accessToken, authData.refreshToken, authData.expiresAt);
    if (authData.merchant) setMerchant(authData.merchant);
    if (authData.user) setUser(authData.user);
}
