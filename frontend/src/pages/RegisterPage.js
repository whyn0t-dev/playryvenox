import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !username || !password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (username.length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }

        setLoading(true);
        const result = await register(email, password, username);
        setLoading(false);

        if (result.success) {
            toast.success('Account created! Welcome aboard!');
            navigate('/game');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="auth-form w-full" data-testid="register-form">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 mb-4">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-muted-foreground mt-2">Start building your AI empire</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium">
                            Username
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your username"
                                className="pl-10 h-11 bg-background border-border rounded-sm"
                                data-testid="register-username-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

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
                                data-testid="register-email-input"
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
                                placeholder="At least 6 characters"
                                className="pl-10 h-11 bg-background border-border rounded-sm"
                                data-testid="register-password-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="pl-10 h-11 bg-background border-border rounded-sm"
                                data-testid="register-confirm-password-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active"
                        disabled={loading}
                        data-testid="register-submit-btn"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create Account
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium" data-testid="go-to-login-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
