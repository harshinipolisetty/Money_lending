import api from './api';

export const getTransactions = async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
};

export const getTransaction = async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
};

export const getTransactionsByType = async (type) => {
    const response = await api.get(`/transactions/type/${type}`);
    return response.data;
};

export const getTransactionsByFriend = async (friendName) => {
    const response = await api.get(`/transactions/${encodeURIComponent(friendName)}`);
    return response.data;
};

export const createTransaction = async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
};

export const updateTransaction = async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
};

export const deleteTransaction = async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
};

export const getFriendSummary = async () => {
    const response = await api.get('/friends/summary');
    return response.data;
};
