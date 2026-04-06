import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Zap, Trophy, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) => `
        px-4 py-2 font-medium transition-colors duration-200
        ${isActive(path) 
            ? 'text-primary' 
            : 'text-muted-foreground hover:text-foreground'}
    `;

    return (
        <nav className="navbar sticky top-0 z-50" data-testid="navbar">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
                        <div className="w-8 h-8 bg-primary/20 border border-primary/40 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:block">
                            Ryvenox Empire
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {isAuthenticated && (
                            <>
                                <Link to="/game" className={navLinkClass('/game')} data-testid="nav-game">
                                    Play
                                </Link>
                                <Link to="/leaderboard" className={navLinkClass('/leaderboard')} data-testid="nav-leaderboard">
                                    <span className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4" />
                                        Leaderboard
                                    </span>
                                </Link>
                                <Link to="/profile" className={navLinkClass('/profile')} data-testid="nav-profile">
                                    <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        Profile
                                    </span>
                                </Link>
                            </>
                        )}
                        
                        {!isAuthenticated && (
                            <Link to="/leaderboard" className={navLinkClass('/leaderboard')} data-testid="nav-leaderboard">
                                <span className="flex items-center gap-1">
                                    <Trophy className="w-4 h-4" />
                                    Leaderboard
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-muted-foreground mr-2">
                                    {user?.username}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="rounded-sm"
                                    data-testid="nav-logout-btn"
                                >
                                    <LogOut className="w-4 h-4 mr-1" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="rounded-sm" data-testid="nav-login-btn">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm" data-testid="nav-register-btn">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        data-testid="mobile-menu-btn"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border" data-testid="mobile-menu">
                        <div className="flex flex-col gap-2">
                            {isAuthenticated ? (
                                <>
                                    <Link 
                                        to="/game" 
                                        className={navLinkClass('/game')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Play
                                    </Link>
                                    <Link 
                                        to="/leaderboard" 
                                        className={navLinkClass('/leaderboard')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Leaderboard
                                    </Link>
                                    <Link 
                                        to="/profile" 
                                        className={navLinkClass('/profile')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/about"
                                        className={navLinkClass('/about')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        About
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className={navLinkClass('/contact')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Contact
                                    </Link>
                                    <Link
                                        to="/faq"
                                        className={navLinkClass('/faq')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        FAQ
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-left text-destructive hover:bg-destructive/10"
                                    >
                                        <span className="flex items-center gap-2">
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/leaderboard" 
                                        className={navLinkClass('/leaderboard')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Leaderboard
                                    </Link>
                                    <Link 
                                        to="/login" 
                                        className={navLinkClass('/login')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className={navLinkClass('/register')}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
