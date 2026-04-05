import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

const formatApiErrorDetail = (detail) => {
    if (detail == null) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((e) => {
                if (e && typeof e.msg === "string") {
                    let msg = e.msg;
                    if (msg.startsWith("Value error, ")) {
                        msg = msg.replace("Value error, ", "");
                    }
                    return msg;
                }
                return JSON.stringify(e);
            })
            .filter(Boolean)
            .join(". ");
    }
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(false);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API}/auth/login`, { email, password });
            setUser(response.data);
            return { success: true, user: response.data };
        } catch (error) {
            const status = error.response?.status;
            let message = formatApiErrorDetail(error.response?.data?.detail);

            if (status === 401) {
                message = "Invalid email or password. Please try again.";
            } else if (status === 429) {
                message = "Too many login attempts. Please wait a minute and try again.";
            } else if (!error.response) {
                message = "Unable to connect to server. Please check your connection.";
            }

            return { success: false, error: message };
        }
    };

    const register = async (email, password, username) => {
        try {
            const response = await axios.post(`${API}/auth/register`, { email, password, username });
            setUser(response.data);
            return { success: true, user: response.data };
        } catch (error) {
            const status = error.response?.status;
            let message = formatApiErrorDetail(error.response?.data?.detail);

            if (status === 409) {
                if (message.toLowerCase().includes("email")) {
                    message = "An account with this email already exists.";
                } else if (message.toLowerCase().includes("username")) {
                    message = "This username is already taken.";
                }
            } else if (status === 429) {
                message = "Too many registration attempts. Please wait a minute.";
            } else if (!error.response) {
                message = "Unable to connect to server. Please check your connection.";
            }

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

export { formatApiErrorDetail };