import api from './api';

export const sendBorrowRequest = async (data) => {
    const response = await api.post('/borrow-requests', data);
    return response.data;
};

export const getSentRequests = async () => {
    const response = await api.get('/borrow-requests/sent');
    return response.data;
};

export const getReceivedRequests = async () => {
    const response = await api.get('/borrow-requests/received');
    return response.data;
};

export const acceptRequest = async (id) => {
    const response = await api.put(`/borrow-requests/${id}/accept`);
    return response.data;
};

export const rejectRequest = async (id) => {
    const response = await api.put(`/borrow-requests/${id}/reject`);
    return response.data;
};
