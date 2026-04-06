import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError(t('login.errors.emailRequired'));
            return;
        }

        if (!password) {
            setError(t('login.errors.passwordRequired'));
            return;
        }

        setLoading(true);
        const result = await login(email.trim(), password);
        setLoading(false);

        if (result.success) {
            const username = result.user?.username || 'player';
            toast.success(t('login.success', { username }));
            navigate('/game');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="auth-form w-full fade-in" data-testid="login-form">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 mb-4">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('login.title')}</h1>
                    <p className="text-muted-foreground mt-2 text-sm">{t('login.subtitle')}</p>
                </div>

                {error && (
                    <div
                        className="mb-6 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2 fade-in"
                        data-testid="login-error"
                    >
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            {t('login.email')}
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder={t('login.emailPlaceholder')}
                                className="pl-10 h-11 bg-background border-border rounded-sm focus:ring-2 focus:ring-primary/20"
                                data-testid="login-email-input"
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            {t('login.password')}
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder={t('login.passwordPlaceholder')}
                                className="pl-10 h-11 bg-background border-border rounded-sm focus:ring-2 focus:ring-primary/20"
                                data-testid="login-password-input"
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active mt-6"
                        disabled={loading}
                        data-testid="login-submit-btn"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('login.loading')}
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4 mr-2" />
                                {t('login.submit')}
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                        {t('login.noAccount')}{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium" data-testid="go-to-register-link">
                            {t('login.signup')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}