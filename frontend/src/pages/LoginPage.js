import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/game');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="auth-form w-full" data-testid="login-form">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 mb-4">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-muted-foreground mt-2">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="pl-10 h-11 bg-background border-border rounded-sm"
                                data-testid="login-email-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="pl-10 h-11 bg-background border-border rounded-sm"
                                data-testid="login-password-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active"
                        disabled={loading}
                        data-testid="login-submit-btn"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign In
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium" data-testid="go-to-register-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
