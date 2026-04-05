import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshIntervalRef = useRef(null);

    const getProfile = useCallback(async (authUser) => {
        if (!authUser) return false;

        const { data, error } = await supabase
            .from('users')
            .select('id, email, username, role, created_at')
            .eq('id', authUser.id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const {
                data: { session },
                error: sessionError
            } = await supabase.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            if (!session?.user) {
                setUser(false);
                return false;
            }

            const profile = await getProfile(session.user);
            setUser(profile);
            return true;
        } catch (error) {
            setUser(false);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getProfile]);

    useEffect(() => {
        checkAuth();

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!session?.user) {
                setUser(false);
                setLoading(false);
                return;
            }

            try {
                const profile = await getProfile(session.user);
                setUser(profile);
            } catch (error) {
                setUser(false);
            } finally {
                setLoading(false);
            }
        });

        refreshIntervalRef.current = setInterval(async () => {
            try {
                const {
                    data: { session }
                } = await supabase.auth.getSession();

                if (!session?.user) {
                    setUser(false);
                    return;
                }

                const profile = await getProfile(session.user);
                setUser(profile);
            } catch (error) {
                setUser(false);
            }
        }, 50 * 60 * 1000);

        return () => {
            subscription?.unsubscribe();

            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [checkAuth, getProfile]);

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            const profile = await getProfile(data.user);
            setUser(profile);

            return { success: true, user: profile };
        } catch (error) {
            let message = formatApiErrorDetail(error.message || error);

            if (
                error.message?.toLowerCase().includes('invalid login credentials')
            ) {
                message = "Invalid email or password. Please try again.";
            } else if (
                error.message?.toLowerCase().includes('email not confirmed')
            ) {
                message = "Please confirm your email address before logging in.";
            }

            return { success: false, error: message };
        }
    };

    const register = async (email, password, username) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username
                    }
                }
            });

            if (error) {
                throw error;
            }

            // Si confirmation email activée, il se peut qu'il n'y ait pas encore de session active immédiate
            if (!data.user) {
                return {
                    success: true,
                    user: null,
                    message: "Account created successfully. Please check your email to confirm your account."
                };
            }

            // On tente de récupérer le profil si déjà créé par le trigger
            try {
                const profile = await getProfile(data.user);
                setUser(profile);
                return { success: true, user: profile };
            } catch (profileError) {
                // Le trigger peut avoir un léger délai
                return {
                    success: true,
                    user: null,
                    message: "Account created successfully."
                };
            }
        } catch (error) {
            let message = formatApiErrorDetail(error.message || error);

            if (message.toLowerCase().includes("already registered")) {
                message = "An account with this email already exists.";
            } else if (message.toLowerCase().includes("username")) {
                message = "This username is already taken.";
            }

            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
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
        checkAuth,
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