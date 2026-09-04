import api from './api';

const persistUser = (user) => {
    localStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify(user));
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data.token) {
        persistUser(response.data.data);
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
        persistUser(response.data.data);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export const updateUpi = async (data) => {
    const response = await api.put('/auth/profile/upi', data);
    return response.data;
};

export const getUserQr = async (userId) => {
    const response = await api.get(`/auth/user/${userId}/qr`);
    return response.data;
};
