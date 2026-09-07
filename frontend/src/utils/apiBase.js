const PRODUCTION_API = 'https://money-lending-1-5xq3.onrender.com/api';

const envApiUrl = () => String(import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

export const getApiBaseUrl = () => {
    if (import.meta.env.DEV) {
        return '/api';
    }

    const envUrl = envApiUrl();
    if (envUrl && !/localhost|127\.0\.0\.1/i.test(envUrl)) {
        return envUrl;
    }

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host !== 'localhost' && host !== '127.0.0.1') {
            return PRODUCTION_API;
        }
    }

    return PRODUCTION_API;
};

export const getSocketOrigin = () => {
    const api = getApiBaseUrl();
    if (api.startsWith('/')) {
        return typeof window !== 'undefined' ? window.location.origin : '';
    }
    return api.replace(/\/api\/?$/, '');
};
