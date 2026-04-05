import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Configure axios defaults
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // null = checking, false = not authenticated, object = authenticated
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/auth/me`);
            setUser(response.data);
        } catch (error) {
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const formatApiErrorDetail = (detail) => {
        if (detail == null) return "Something went wrong. Please try again.";
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail))
            return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
        if (detail && typeof detail.msg === "string") return detail.msg;
        return String(detail);
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API}/auth/login`, { email, password });
            setUser(response.data);
            return { success: true };
        } catch (error) {
            const message = formatApiErrorDetail(error.response?.data?.detail) || error.message;
            return { success: false, error: message };
        }
    };

    const register = async (email, password, username) => {
        try {
            const response = await axios.post(`${API}/auth/register`, { email, password, username });
            setUser(response.data);
            return { success: true };
        } catch (error) {
            const message = formatApiErrorDetail(error.response?.data?.detail) || error.message;
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(false);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && user !== false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
