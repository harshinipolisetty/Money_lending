import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token and user in local storage on initial load
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error("Error parsing user from local storage", error);
                authService.logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data.data);
        setToken(data.data.token);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data.data);
        setToken(data.data.token);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const refreshProfile = async () => {
        const data = await authService.getProfile();
        setUser((prev) => {
            const merged = { ...prev, ...data.data, token: token || prev?.token };
            localStorage.setItem('user', JSON.stringify(merged));
            return merged;
        });
        return data;
    };

    const updateUpi = async (payload) => {
        const data = await authService.updateUpi(payload);
        setUser((prev) => {
            const merged = { ...prev, ...data.data, token: token || prev?.token };
            localStorage.setItem('user', JSON.stringify(merged));
            return merged;
        });
        return data;
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshProfile,
        updateUpi
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
