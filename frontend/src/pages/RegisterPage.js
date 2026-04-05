import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    // Password strength indicators
    const passwordChecks = {
        length: password.length >= 8,
        letter: /[a-zA-Z]/.test(password),
        number: /\d/.test(password),
    };
    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError('Username can only contain letters, numbers, and underscores');
            return;
        }

        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }

        if (!password) {
            setError('Please enter a password');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!passwordChecks.letter || !passwordChecks.number) {
            setError('Password must contain at least one letter and one number');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register(email.trim(), password, username.trim());
        setLoading(false);

        if (result.success) {
            toast.success('Account created! Welcome aboard!');
            navigate('/game');
        } else {
            setError(result.error);
        }
    };

    const clearError = () => setError('');

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="auth-form w-full fade-in" data-testid="register-form">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 mb-4">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Start building your AI empire</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2 fade-in" data-testid="register-error">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                onChange={(e) => { setUsername(e.target.value); clearError(); }}
                                placeholder="Your username"
                                className="pl-10 h-11 bg-background border-border rounded-sm focus:ring-2 focus:ring-primary/20"
                                data-testid="register-username-input"
                                disabled={loading}
                                autoComplete="username"
                                maxLength={30}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">3-30 characters, letters, numbers, underscores only</p>
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
                                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                                placeholder="you@example.com"
                                className="pl-10 h-11 bg-background border-border rounded-sm focus:ring-2 focus:ring-primary/20"
                                data-testid="register-email-input"
                                disabled={loading}
                                autoComplete="email"
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
                                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                                placeholder="Create a strong password"
                                className="pl-10 h-11 bg-background border-border rounded-sm focus:ring-2 focus:ring-primary/20"
                                data-testid="register-password-input"
                                disabled={loading}
                                autoComplete="new-password"
                            />
                        </div>
                        
                        {/* Password strength indicator */}
                        {password && (
                            <div className="space-y-2 mt-2 fade-in">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-colors ${
                                                passwordStrength >= level
                                                    ? passwordStrength === 3
                                                        ? 'bg-green-500'
                                                        : passwordStrength === 2
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                    : 'bg-muted'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col gap-1 text-xs">
                                    <PasswordCheck checked={passwordChecks.length} text="At least 8 characters" />
                                    <PasswordCheck checked={passwordChecks.letter} text="Contains a letter" />
                                    <PasswordCheck checked={passwordChecks.number} text="Contains a number" />
                                </div>
                            </div>
                        )}
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
                                onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                                placeholder="Confirm your password"
                                className="pl-10 h-11 bg-background border-border rounded-sm focus:ring-2 focus:ring-primary/20"
                                data-testid="register-confirm-password-input"
                                disabled={loading}
                                autoComplete="new-password"
                            />
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-destructive flex items-center gap-1 fade-in">
                                <AlertCircle className="w-3 h-3" />
                                Passwords don't match
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active mt-6"
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

function PasswordCheck({ checked, text }) {
    return (
        <div className={`flex items-center gap-1.5 ${checked ? 'text-green-500' : 'text-muted-foreground'}`}>
            <CheckCircle2 className={`w-3 h-3 ${checked ? 'opacity-100' : 'opacity-30'}`} />
            <span>{text}</span>
        </div>
    );
}
