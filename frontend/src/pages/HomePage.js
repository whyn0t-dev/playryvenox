import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
    Rocket,
    Users,
    TrendingUp,
    Zap,
    Trophy,
    Bot,
    MousePointer,
    Crown,
    Flame,
    Target,
    Star
} from 'lucide-react';
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
                const data = response.data;

                if (Array.isArray(data)) {
                    setTopPlayers(data);
                } else if (data && Array.isArray(data.players)) {
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

    const topPlayer = Array.isArray(topPlayers) && topPlayers.length > 0 ? topPlayers[0] : null;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden border-b border-border">
                {/* Background */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1639066648921-82d4500abf1a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2VydmVyJTIwcm9vbSUyMHRlY2h8ZW58MHx8fHwxNzc1Mzc3NzgzfDA&ixlib=rb-4.1.0&q=85)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="absolute inset-0 bg-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-background" />
                </div>

                {/* Decorative glow */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-3xl rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-sm mb-8 backdrop-blur-sm">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary tracking-wide">
                                IDLE CLICKER GAME • BUILD • AUTOMATE • DOMINATE
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-6 text-glow-strong leading-none">
                            BUILD THE NEXT
                            <br />
                            <span className="text-primary">AI EMPIRE</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                            Start with nothing. Acquire users, unlock upgrades, automate your growth,
                            and climb the leaderboard until your startup becomes unstoppable.
                        </p>

                        {/* Social Proof Strip */}
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
                            <div className="px-4 py-2 bg-background/50 border border-border rounded-sm backdrop-blur-sm text-sm text-muted-foreground">
                                <span className="text-foreground font-semibold">Fast to start</span> • addictive in seconds
                            </div>
                            <div className="px-4 py-2 bg-background/50 border border-border rounded-sm backdrop-blur-sm text-sm text-muted-foreground">
                                <span className="text-foreground font-semibold">Compete globally</span> • top leaderboard race
                            </div>
                            <div className="px-4 py-2 bg-background/50 border border-border rounded-sm backdrop-blur-sm text-sm text-muted-foreground">
                                <span className="text-foreground font-semibold">Scale smart</span> • clicks + passive income
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            {isAuthenticated ? (
                                <Link to="/game">
                                    <Button
                                        data-testid="play-now-btn"
                                        className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active shadow-lg shadow-primary/20"
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
                                            className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active shadow-lg shadow-primary/20"
                                        >
                                            <Rocket className="w-5 h-5 mr-2" />
                                            START BUILDING
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

                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            <div className="stats-card text-left">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                    <MousePointer className="w-4 h-4 text-primary" />
                                    Start Simple
                                </div>
                                <div className="text-lg font-semibold mb-1">Click to acquire users</div>
                                <p className="text-sm text-muted-foreground">
                                    Every click grows your startup and pushes you closer to your next upgrade.
                                </p>
                            </div>

                            <div className="stats-card text-left">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                    <Bot className="w-4 h-4 text-primary" />
                                    Scale Automatically
                                </div>
                                <div className="text-lg font-semibold mb-1">Unlock passive income</div>
                                <p className="text-sm text-muted-foreground">
                                    Automate growth and keep generating users even while you’re away.
                                </p>
                            </div>

                            <div className="stats-card text-left">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                    <Trophy className="w-4 h-4 text-primary" />
                                    Compete for Glory
                                </div>
                                <div className="text-lg font-semibold mb-1">Beat the best founders</div>
                                <p className="text-sm text-muted-foreground">
                                    Climb the leaderboard and prove your startup deserves the crown.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why It Hooks Section */}
            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-sm mb-4">
                            <Flame className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">Why players keep coming back</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                            Easy to start. Hard to stop.
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            The thrill of growth, the satisfaction of automation, and the pressure of competition —
                            all in one addictive startup simulator.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Instant Progress</h3>
                            <p className="text-muted-foreground">
                                You feel stronger every minute with better click power, faster growth,
                                and more meaningful upgrades.
                            </p>
                        </div>

                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Strategic Choices</h3>
                            <p className="text-muted-foreground">
                                Choose between immediate gains and long-term automation to optimize
                                your startup’s path to domination.
                            </p>
                        </div>

                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Crown className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Leaderboard Pressure</h3>
                            <p className="text-muted-foreground">
                                Every gain matters when other founders are racing for the same top spot.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                            How It Works
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            From solo founder to global AI giant in three simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stats-card relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-5xl font-black text-primary/10">01</div>
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Click to Grow</h3>
                            <p className="text-muted-foreground">
                                Launch campaigns and bring in your first users. Small beginnings lead to massive growth.
                            </p>
                        </div>

                        <div className="stats-card relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-5xl font-black text-primary/10">02</div>
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upgrade & Automate</h3>
                            <p className="text-muted-foreground">
                                Boost click power, unlock passive income, and turn your startup into a growth machine.
                            </p>
                        </div>

                        <div className="stats-card relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-5xl font-black text-primary/10">03</div>
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Compete Globally</h3>
                            <p className="text-muted-foreground">
                                Race up the leaderboard and build the startup everyone else is trying to catch.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Preview */}
            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-sm mb-3">
                                <Star className="w-4 h-4 text-primary" />
                                <span className="text-sm text-primary font-medium">Live competition energy</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-primary" />
                                Top Players
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl">
                                The strongest founders are already scaling. Your name could be next on this list.
                            </p>
                        </div>

                        <Link to="/leaderboard">
                            <Button variant="outline" className="rounded-sm" data-testid="view-all-leaderboard-btn">
                                View Full Leaderboard
                            </Button>
                        </Link>
                    </div>

                    {topPlayer && !loading && (
                        <div className="stats-card mb-6 border-primary/30 bg-primary/5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                                        <Crown className="w-4 h-4" />
                                        Current #1 Founder
                                    </div>
                                    <div className="text-2xl font-bold">{topPlayer.username}</div>
                                    <p className="text-muted-foreground mt-1">
                                        Already generated {formatNumber(topPlayer.total_users_generated)} users and reached level {topPlayer.level}.
                                    </p>
                                </div>
                                {!isAuthenticated && (
                                    <Link to="/register">
                                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active">
                                            Try to beat them
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

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
                                            No players yet. Be the first founder to dominate the leaderboard.
                                        </td>
                                    </tr>
                                ) : (
                                    topPlayers.slice(0, 10).map((player) => (
                                        <tr key={player.rank} data-testid={`leaderboard-row-${player.rank}`}>
                                            <td
                                                className={`font-mono font-bold ${
                                                    player.rank === 1
                                                        ? 'rank-1'
                                                        : player.rank === 2
                                                        ? 'rank-2'
                                                        : player.rank === 3
                                                        ? 'rank-3'
                                                        : ''
                                                }`}
                                            >
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

            {/* Final CTA */}
            {!isAuthenticated && (
                <section className="py-20 border-t border-border">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center stats-card border-primary/20 bg-gradient-to-b from-primary/10 to-transparent">
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-sm mb-5">
                                <Rocket className="w-4 h-4 text-primary" />
                                <span className="text-sm text-primary font-medium">Start free</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                                Ready to launch your AI startup?
                            </h2>

                            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                                Build faster, scale smarter, automate growth, and compete for the top spot.
                                Your empire starts with a single click.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register">
                                    <Button
                                        data-testid="cta-start-playing-btn"
                                        className="h-12 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active"
                                    >
                                        Start Playing Free
                                    </Button>
                                </Link>

                                <Link to="/leaderboard">
                                    <Button
                                        variant="outline"
                                        className="h-12 px-8 text-lg font-medium rounded-sm"
                                    >
                                        See the Competition
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}