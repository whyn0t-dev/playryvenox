import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, Zap, TrendingUp, ShoppingCart, MousePointer, Bot, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GamePage() {
    const [gameState, setGameState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clicking, setClicking] = useState(false);
    const [buyingUpgrade, setBuyingUpgrade] = useState(null);
    const [clickFeedback, setClickFeedback] = useState([]);
    const feedbackIdRef = useRef(0);
    const clickerRef = useRef(null);

    const fetchGameState = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/game/state`);
            setGameState(response.data);
        } catch (error) {
            console.error('Error fetching game state:', error);
            toast.error('Failed to load game state');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGameState();
        
        // Refresh game state periodically for passive income
        const interval = setInterval(fetchGameState, 5000);
        return () => clearInterval(interval);
    }, [fetchGameState]);

    const handleClick = async (e) => {
        if (clicking) return;
        
        setClicking(true);
        
        // Add visual feedback at click position
        const rect = clickerRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = feedbackIdRef.current++;
            const gained = gameState?.click_power || 1;
            
            setClickFeedback(prev => [...prev, { id, x, y, value: gained }]);
            
            // Remove feedback after animation
            setTimeout(() => {
                setClickFeedback(prev => prev.filter(f => f.id !== id));
            }, 800);
        }

        try {
            const response = await axios.post(`${API}/game/click`);
            setGameState(prev => ({
                ...prev,
                current_users: response.data.current_users,
                total_users_generated: response.data.total_users_generated,
                upgrades: prev.upgrades.map(u => ({
                    ...u,
                    can_afford: response.data.current_users >= u.cost
                }))
            }));
        } catch (error) {
            console.error('Click error:', error);
        } finally {
            setClicking(false);
        }
    };

    const handleBuyUpgrade = async (upgradeId) => {
        if (buyingUpgrade) return;
        
        setBuyingUpgrade(upgradeId);
        
        try {
            const response = await axios.post(`${API}/game/buy-upgrade`, { upgrade_id: upgradeId });
            
            if (response.data.success) {
                toast.success(`Upgraded ${response.data.upgrade_id}!`);
                // Refresh full game state to get updated costs
                await fetchGameState();
            }
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to buy upgrade';
            toast.error(message);
        } finally {
            setBuyingUpgrade(null);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toLocaleString();
    };

    const formatCost = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const clickUpgrades = gameState?.upgrades?.filter(u => u.type === 'click') || [];
    const passiveUpgrades = gameState?.upgrades?.filter(u => u.type === 'passive') || [];

    return (
        <div className="min-h-screen py-6 px-4" data-testid="game-page">
            <div className="container mx-auto max-w-7xl">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <div className="stats-card" data-testid="stat-current-users">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Users className="w-4 h-4" />
                            <span>Current Users</span>
                        </div>
                        <div className="text-2xl lg:text-3xl font-mono font-bold text-glow">
                            {formatNumber(gameState?.current_users || 0)}
                        </div>
                    </div>
                    
                    <div className="stats-card" data-testid="stat-total-users">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>Total Generated</span>
                        </div>
                        <div className="text-2xl lg:text-3xl font-mono font-bold">
                            {formatNumber(gameState?.total_users_generated || 0)}
                        </div>
                    </div>
                    
                    <div className="stats-card" data-testid="stat-click-power">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <MousePointer className="w-4 h-4" />
                            <span>Click Power</span>
                        </div>
                        <div className="text-2xl lg:text-3xl font-mono font-bold text-primary">
                            +{gameState?.click_power || 1}
                        </div>
                    </div>
                    
                    <div className="stats-card" data-testid="stat-passive-income">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Bot className="w-4 h-4" />
                            <span>Passive Income</span>
                        </div>
                        <div className="text-2xl lg:text-3xl font-mono font-bold text-green-400">
                            +{gameState?.passive_income || 0}/s
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Clicker Area */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center py-8">
                        <div className="text-center mb-6">
                            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
                                Level {gameState?.level || 1}
                            </div>
                            <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-black text-glow-strong" data-testid="main-user-counter">
                                {formatNumber(gameState?.current_users || 0)}
                            </div>
                            <div className="text-muted-foreground mt-2">users</div>
                        </div>

                        {/* Clicker Button */}
                        <div className="relative" ref={clickerRef}>
                            <button
                                onClick={handleClick}
                                className="clicker-button no-select"
                                data-testid="launch-campaign-btn"
                            >
                                <Zap className="w-12 h-12 text-primary-foreground mb-1" />
                                <span className="text-primary-foreground font-bold text-sm">LAUNCH</span>
                                <span className="text-primary-foreground font-bold text-sm">CAMPAIGN</span>
                            </button>
                            
                            {/* Click Feedback */}
                            {clickFeedback.map(fb => (
                                <div
                                    key={fb.id}
                                    className="absolute pointer-events-none text-primary font-mono font-bold text-2xl float-up"
                                    style={{ left: fb.x, top: fb.y, transform: 'translate(-50%, -50%)' }}
                                >
                                    +{fb.value}
                                </div>
                            ))}
                        </div>

                        <div className="text-muted-foreground text-sm mt-6">
                            Click to acquire users
                        </div>
                    </div>

                    {/* Upgrades Panel */}
                    <div className="lg:col-span-7">
                        <div className="stats-card h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    Upgrades
                                </h2>
                            </div>

                            <ScrollArea className="h-[500px] pr-4">
                                {/* Click Upgrades */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <MousePointer className="w-4 h-4" />
                                        Click Power
                                    </h3>
                                    <div className="space-y-2">
                                        {clickUpgrades.map(upgrade => (
                                            <UpgradeItem
                                                key={upgrade.id}
                                                upgrade={upgrade}
                                                onBuy={handleBuyUpgrade}
                                                buying={buyingUpgrade === upgrade.id}
                                                formatCost={formatCost}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Passive Upgrades */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Bot className="w-4 h-4" />
                                        Passive Income
                                    </h3>
                                    <div className="space-y-2">
                                        {passiveUpgrades.map(upgrade => (
                                            <UpgradeItem
                                                key={upgrade.id}
                                                upgrade={upgrade}
                                                onBuy={handleBuyUpgrade}
                                                buying={buyingUpgrade === upgrade.id}
                                                formatCost={formatCost}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UpgradeItem({ upgrade, onBuy, buying, formatCost }) {
    return (
        <div 
            className={`upgrade-card flex items-center justify-between ${upgrade.can_afford ? 'can-afford' : ''}`}
            data-testid={`upgrade-${upgrade.id}`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{upgrade.name}</span>
                    {upgrade.level > 0 && (
                        <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary font-mono">
                            LVL {upgrade.level}
                        </span>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    {upgrade.description}
                </div>
            </div>
            
            <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                    <div className={`font-mono text-sm ${upgrade.can_afford ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {formatCost(upgrade.cost)}
                    </div>
                </div>
                <Button
                    onClick={() => onBuy(upgrade.id)}
                    disabled={!upgrade.can_afford || buying}
                    className="h-9 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-sm btn-active"
                    data-testid={`buy-${upgrade.id}-btn`}
                >
                    {buying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'BUY'
                    )}
                </Button>
            </div>
        </div>
    );
}
