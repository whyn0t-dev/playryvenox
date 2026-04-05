import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Rocket, Users, TrendingUp, Zap, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
    const { isAuthenticated } = useAuth();
    const [topPlayers, setTopPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopPlayers = async () => {
            try {
                const response = await axios.get(`${API}/leaderboard/top10`);
                // Ensure we always have an array
                const data = response.data;
                if (Array.isArray(data)) {
                    setTopPlayers(data);
                } else if (data && Array.isArray(data.players)) {
                    // Handle case where API returns {players: [...]}
                    setTopPlayers(data.players);
                } else {
                    console.error('Unexpected leaderboard response format:', data);
                    setTopPlayers([]);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setTopPlayers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTopPlayers();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toLocaleString();
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1639066648921-82d4500abf1a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2VydmVyJTIwcm9vbSUyMHRlY2h8ZW58MHx8fHwxNzc1Mzc3NzgzfDA&ixlib=rb-4.1.0&q=85)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="absolute inset-0 bg-black/80" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-sm mb-8">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary tracking-wide">IDLE CLICKER GAME</span>
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-6 text-glow-strong">
                            AI STARTUP<br />
                            <span className="text-primary">CLICKER</span>
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Build your AI empire from scratch. Click to acquire users, 
                            automate growth, and dominate the global leaderboard.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isAuthenticated ? (
                                <Link to="/game">
                                    <Button 
                                        data-testid="play-now-btn"
                                        className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active"
                                    >
                                        <Rocket className="w-5 h-5 mr-2" />
                                        PLAY NOW
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register">
                                        <Button 
                                            data-testid="get-started-btn"
                                            className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active"
                                        >
                                            <Rocket className="w-5 h-5 mr-2" />
                                            GET STARTED
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button 
                                            data-testid="login-btn"
                                            variant="outline" 
                                            className="h-14 px-10 text-lg font-medium border-border hover:bg-secondary rounded-sm"
                                        >
                                            LOGIN
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 tracking-tight">
                        How It Works
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Click to Grow</h3>
                            <p className="text-muted-foreground">
                                Launch campaigns to acquire users. Each click brings new users to your startup.
                            </p>
                        </div>
                        
                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upgrade & Automate</h3>
                            <p className="text-muted-foreground">
                                Purchase upgrades to increase click power and passive income generation.
                            </p>
                        </div>
                        
                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Compete Globally</h3>
                            <p className="text-muted-foreground">
                                Climb the leaderboard and prove you're the ultimate AI startup founder.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Preview */}
            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-primary" />
                            Top Players
                        </h2>
                        <Link to="/leaderboard">
                            <Button variant="outline" className="rounded-sm" data-testid="view-all-leaderboard-btn">
                                View All
                            </Button>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="leaderboard-table" data-testid="home-leaderboard-table">
                            <thead>
                                <tr>
                                    <th className="w-20">Rank</th>
                                    <th>Player</th>
                                    <th className="text-right">Total Users</th>
                                    <th className="text-right w-24">Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : !Array.isArray(topPlayers) || topPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No players yet. Be the first!
                                        </td>
                                    </tr>
                                ) : (
                                    topPlayers.slice(0, 10).map((player) => (
                                        <tr key={player.rank} data-testid={`leaderboard-row-${player.rank}`}>
                                            <td className={`font-mono font-bold ${
                                                player.rank === 1 ? 'rank-1' : 
                                                player.rank === 2 ? 'rank-2' : 
                                                player.rank === 3 ? 'rank-3' : ''
                                            }`}>
                                                #{player.rank}
                                            </td>
                                            <td className="font-medium">{player.username}</td>
                                            <td className="text-right font-mono">
                                                {formatNumber(player.total_users_generated)}
                                            </td>
                                            <td className="text-right">
                                                <span className="px-2 py-1 bg-primary/10 text-primary text-sm font-medium">
                                                    LVL {player.level}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="py-20 border-t border-border">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
                            Ready to Build Your Empire?
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Join thousands of players competing to build the most successful AI startup.
                        </p>
                        <Link to="/register">
                            <Button 
                                data-testid="cta-start-playing-btn"
                                className="h-12 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active"
                            >
                                Start Playing Free
                            </Button>
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}
