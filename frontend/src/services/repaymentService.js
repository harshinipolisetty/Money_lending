import api from './api';

export const requestRepayment = async (data) => {
    const response = await api.post('/repayments/request', data);
    return response.data;
};

export const getPendingRepayments = async () => {
    const response = await api.get('/repayments/pending');
    return response.data;
};

export const getRepaymentHistory = async () => {
    const response = await api.get('/repayments/history');
    return response.data;
};

export const approveRepayment = async (id) => {
    const response = await api.put(`/repayments/${id}/approve`);
    return response.data;
};

export const rejectRepayment = async (id) => {
    const response = await api.put(`/repayments/${id}/reject`);
    return response.data;
};
