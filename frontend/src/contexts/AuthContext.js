import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

    const getProfile = useCallback(async (authUser) => {
        if (!authUser) return null;

        const { data, error } = await supabase
            .from('users')
            .select('id, email, username, role, created_at')
            .eq('id', authUser.id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }, []);

    const buildFallbackUser = (authUser) => ({
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username ?? null,
        role: 'player'
    });

    const loadCurrentUser = useCallback(async () => {
        try {
            const {
                data: { session },
                error: sessionError
            } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (!session?.user) {
                setUser(false);
                return false;
            }

            try {
                const profile = await getProfile(session.user);
                setUser(profile ?? {
                    id: session.user.id,
                    email: session.user.email,
                    username: session.user.user_metadata?.username ?? null,
                    role: 'player'
                });
            } catch (profileError) {
                console.error('getProfile failed:', profileError);
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    username: session.user.user_metadata?.username ?? null,
                    role: 'player'
                });
            }

            return true;
        } catch (error) {
            console.error('loadCurrentUser error:', error);
            setUser(false);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getProfile]);

    useEffect(() => {
        loadCurrentUser();

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((event, session) => {
            setTimeout(async () => {
                try {
                    if (!session?.user) {
                        setUser(false);
                        setLoading(false);
                        return;
                    }

                    try {
                        const profile = await getProfile(session.user);
                        setUser(profile ?? {
                            id: session.user.id,
                            email: session.user.email,
                            username: session.user.user_metadata?.username ?? null,
                            role: 'player'
                        });
                    } catch (profileError) {
                        console.error('onAuthStateChange getProfile error:', profileError);
                        setUser({
                            id: session.user.id,
                            email: session.user.email,
                            username: session.user.user_metadata?.username ?? null,
                            role: 'player'
                        });
                    }
                } catch (error) {
                    console.error('onAuthStateChange error:', error);
                    setUser(false);
                } finally {
                    setLoading(false);
                }
            }, 0);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [loadCurrentUser, getProfile]);

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (!data?.user) {
                return {
                    success: false,
                    error: "Unable to retrieve user after login."
                };
            }

            const profile = await getProfile(data.user);
            const resolvedUser = profile ?? buildFallbackUser(data.user);
            setUser(resolvedUser);
            return { success: true, user: resolvedUser };
        } catch (error) {
            let message = formatApiErrorDetail(error.message || error);

            if (error.message?.toLowerCase().includes('invalid login credentials')) {
                message = "Invalid email or password. Please try again.";
            } else if (error.message?.toLowerCase().includes('email not confirmed')) {
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
                    // optionnel :
                    // emailRedirectTo: `${window.location.origin}/login`
                }
            });

            if (error) throw error;

            // Avec confirmation email activée, on privilégie ce scénario
            if (!data?.session) {
                return {
                    success: true,
                    user: null,
                    message: "Account created successfully. Please check your email to confirm your account."
                };
            }

            // Si session immédiate disponible
            try {
                const profile = await getProfile(data.user);
                const resolvedUser = profile ?? buildFallbackUser(data.user);
                setUser(resolvedUser);

                return { success: true, user: resolvedUser };
            } catch (profileError) {
                console.error('register getProfile error:', profileError);

                const fallbackUser = buildFallbackUser(data.user);
                setUser(fallbackUser);

                return {
                    success: true,
                    user: fallbackUser,
                    message: "Account created successfully."
                };
            }
        } catch (error) {
            let message = formatApiErrorDetail(error.message || error);

            if (message.toLowerCase().includes("already registered")) {
                message = "An account with this email already exists.";
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
        checkAuth: loadCurrentUser,
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