import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, Zap, TrendingUp, ShoppingCart, MousePointer, Bot, Loader2, Sparkles, ChevronUp, SendHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { formatApiErrorDetail } from '../contexts/AuthContext';
import DailyBonus from '../components/DailyBonus';
import { supabase } from '../lib/supabase';
import { useTranslation } from "react-i18next";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GamePage() {
    const { t } = useTranslation();
    const [gameState, setGameState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clicking, setClicking] = useState(false);
    const [buyingUpgrade, setBuyingUpgrade] = useState(null);
    const [clickFeedback, setClickFeedback] = useState([]);
    const [counterAnimating, setCounterAnimating] = useState(false);
    const feedbackIdRef = useRef(0);
    const clickerRef = useRef(null);
    const lastClickTime = useRef(0);
    const hasShownOfflineToast = useRef(false);
    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [transferStatus, setTransferStatus] = useState(null);

    const getAuthHeaders = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error("No active session");
        }

        return {
            Authorization: `Bearer ${session.access_token}`,
        };
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

    const fetchGameState = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);

        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API}/game/state`, { headers });
            setGameState(response.data);

            if (!hasShownOfflineToast.current && response.data?.offline_earned > 0) {
                toast.success(
                    t("game.toasts.offlineEarned", {
                        amount: formatNumber(response.data.offline_earned),
                    })
                );
                hasShownOfflineToast.current = true;
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(t("game.errors.syncFailed"));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTransferStatus = useCallback(async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API}/transfer/status`, { headers });
            setTransferStatus(response.data);
        } catch (error) {
            console.error("Failed to fetch transfer status");
        }
    }, []);

    useEffect(() => {
        fetchGameState(true);
        fetchTransferStatus();

        const interval = setInterval(() => {
            fetchGameState(false);
            fetchTransferStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchGameState, fetchTransferStatus]);

    const handleClick = async (e) => {
        // Throttle clicks to prevent spam
        const now = Date.now();
        if (now - lastClickTime.current < 50) return;
        lastClickTime.current = now;

        if (clicking) return;
        setClicking(true);

        // Add visual feedback at click position
        const rect = clickerRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = feedbackIdRef.current++;
            const gained = gameState?.click_power || 1;

            setClickFeedback(prev => [...prev.slice(-10), { id, x, y, value: gained }]);

            // Remove feedback after animation
            setTimeout(() => {
                setClickFeedback(prev => prev.filter(f => f.id !== id));
            }, 700);
        }

        // Trigger counter animation
        setCounterAnimating(true);
        setTimeout(() => setCounterAnimating(false), 200);

        try {
            const headers = await getAuthHeaders();
            const response = await axios.post(`${API}/game/click`, {}, { headers });

            setGameState(prev => ({
                ...prev,
                current_users: response.data.current_users,
                total_users_generated: response.data.total_users_generated,
                upgrades: (prev?.upgrades || []).map(u => ({
                    ...u,
                    can_afford: response.data.current_users >= u.cost
                }))
            }));
        } catch (error) {
            if (error.response?.status === 429) {
                toast.error(t("game.errors.tooManyClicks"));
            }
        } finally {
            setClicking(false);
        }
    };

    const handleBuyUpgrade = async (upgradeId, upgradeName) => {
        if (buyingUpgrade) return;

        setBuyingUpgrade(upgradeId);

        try {
            const headers = await getAuthHeaders();
            const response = await axios.post(
                `${API}/game/buy-upgrade`,
                { upgrade_id: upgradeId },
                { headers }
            );

            if (response.data.success) {
                toast.success(
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>
                            <strong>{response.data.upgrade_name}</strong>{" "}
                            {t("game.toasts.upgradedToLevel", { level: response.data.new_level })}
                        </span>
                    </div>
                );
                await fetchGameState(false);
                await fetchTransferStatus();
            }
        } catch (error) {
            const message =
                formatApiErrorDetail(error.response?.data?.detail) ||
                t("game.errors.buyUpgradeFailed");
            toast.error(message);
        } finally {
            setBuyingUpgrade(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">{t("game.loading")}</p>
                </div>
            </div>
        );
    }

    const clickUpgrades = gameState?.upgrades?.filter(u => u.type === 'click') || [];
    const passiveUpgrades = gameState?.upgrades?.filter(u => u.type === 'passive') || [];

    // Callback when daily bonus is claimed
    const handleDailyClaim = () => {
        fetchGameState(false);
        fetchTransferStatus();
    };

    const handleTransferUsers = async () => {
        const recipient = transferRecipient.trim();
        const amount = Number(transferAmount);

        if (!recipient) {
            toast.error(t("game.transfer.errors.recipientRequired"));
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error(t("game.transfer.errors.invalidAmount"));
            return;
        }

        if ((gameState?.current_users || 0) < amount) {
            toast.error(t("game.transfer.errors.notEnoughUsers"));
            return;
        }

        setTransferring(true);

        try {
            const headers = await getAuthHeaders();

            const response = await axios.post(
                `${API}/transfer/send`,
                {
                    recipient_username: recipient,
                    amount
                },
                { headers }
            );

            toast.success(
                <div className="flex items-center gap-2">
                    <SendHorizontal className="w-4 h-4 text-primary" />
                    <span>
                        {t("game.transfer.success", {
                            sent: formatNumber(response.data.amount_sent),
                            recipient: response.data.recipient_username,
                            received: formatNumber(response.data.amount_received),
                        })}
                    </span>
                </div>
            );

            setTransferRecipient('');
            setTransferAmount('');
            await fetchGameState(false);
            await fetchTransferStatus();
        } catch (error) {
            const message =
                formatApiErrorDetail(error.response?.data?.detail) ||
                t("game.transfer.errors.failed");
            toast.error(message);
        } finally {
            setTransferring(false);
        }
    };

    return (
        <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4" data-testid="game-page">
            <div className="container mx-auto max-w-7xl">
                {/* Header with Daily Bonus */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">
                        {t("game.level")} <span className="text-primary font-bold">{gameState?.level || 1}</span>
                    </div>
                    <DailyBonus onClaim={handleDailyClaim} />
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="stats-card-highlight fade-in" data-testid="stat-current-users">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-1">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{t("game.stats.currentUsers")}</span>
                        </div>
                        <div className={`text-xl sm:text-2xl lg:text-3xl counter-display text-glow ${counterAnimating ? 'counter-bump' : ''}`}>
                            {formatNumber(gameState?.current_users || 0)}
                        </div>
                    </div>

                    <div className="stats-card fade-in stagger-1" data-testid="stat-total-users">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-1">
                            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{t("game.stats.currentUsers")}</span>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl counter-display">
                            {formatNumber(gameState?.total_users_generated || 0)}
                        </div>
                    </div>

                    <div className="stats-card fade-in stagger-2" data-testid="stat-click-power">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-1">
                            <MousePointer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{t("game.stats.clickPower")}</span>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl counter-display text-primary">
                            +{gameState?.click_power || 1}
                        </div>
                    </div>

                    <div className="stats-card fade-in stagger-3" data-testid="stat-passive-income">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-1">
                            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{t("game.stats.passiveIncome")}</span>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl counter-display text-glow-success" style={{ color: 'hsl(142, 76%, 55%)' }}>
                            +{gameState?.passive_income || 0}/s
                        </div>
                    </div>
                </div>

                {/* Transfer Users Panel */}
                <div className="stats-card mb-4 sm:mb-6 fade-in stagger-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            <SendHorizontal className="w-5 h-5 text-primary" />
                            {t("game.transfer.title")}
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            {t("game.transfer.balance", {
                                amount: formatNumber(gameState?.current_users || 0),
                            })}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                                {t("game.transfer.recipient")}
                            </label>
                            <input
                                type="text"
                                value={transferRecipient}
                                onChange={(e) => setTransferRecipient(e.target.value)}
                                placeholder={t("game.transfer.recipientPlaceholder")}
                                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                data-testid="transfer-recipient-input"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                                {t("game.transfer.amount")}
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder={t("game.transfer.amountPlaceholder")}
                                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                data-testid="transfer-amount-input"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleTransferUsers}
                                disabled={
                                    transferring ||
                                    !transferStatus ||
                                    !transferStatus.can_send
                                }
                                className="w-full h-10 font-bold"
                                data-testid="transfer-users-btn"
                            >
                                {transferring ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <SendHorizontal className="w-4 h-4 mr-2" />
                                        {t("game.transfer.submit")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {transferStatus && (
                            <>
                                <div>
                                    {t("game.transfer.requiredLevel", {
                                        level: transferStatus.min_level_required,
                                    })}
                                </div>
                                <div>
                                    {t("game.transfer.fee", {
                                        percent: transferStatus.fee_percent,
                                    })}
                                </div>
                                <div>
                                    {t("game.transfer.remainingLimit", {
                                        remaining: formatNumber(transferStatus.remaining_in_window),
                                        limit: formatNumber(transferStatus.window_limit),
                                    })}
                                </div>
                            </>
                        )}

                        {transferStatus && !transferStatus.can_send && (
                            <div className="text-red-400">
                                {t("game.transfer.levelRequiredWarning", {
                                    level: transferStatus.min_level_required,
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* Main Clicker Area */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center py-6 sm:py-8 fade-in">
                        <div className="text-center mb-4 sm:mb-6">
                            <div className="inline-block level-badge mb-3">
                                {t("game.levelBadge")} {gameState?.level || 1}
                            </div>
                            <div
                                className={`text-5xl sm:text-6xl lg:text-7xl counter-display text-glow-strong ${counterAnimating ? 'counter-bump' : ''}`}
                                data-testid="main-user-counter"
                            >
                                {formatNumber(gameState?.current_users || 0)}
                            </div>
                            <div className="text-muted-foreground mt-1 text-sm">{t("game.users")}</div>
                        </div>

                        {/* Clicker Button */}
                        <div className="relative" ref={clickerRef}>
                            <button
                                onClick={handleClick}
                                className="clicker-button no-select glow-pulse"
                                data-testid="launch-campaign-btn"
                            >
                                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground mb-1" />
                                <span className="text-primary-foreground font-bold text-xs sm:text-sm tracking-wide">
                                    {t("game.clicker.launch")}
                                </span>
                                <span className="text-primary-foreground font-bold text-xs sm:text-sm tracking-wide">
                                    {t("game.clicker.campaign")}
                                </span>
                            </button>

                            {/* Click Feedback */}
                            {clickFeedback.map(fb => (
                                <div
                                    key={fb.id}
                                    className="absolute pointer-events-none text-primary font-mono font-bold text-xl sm:text-2xl float-up"
                                    style={{ left: fb.x, top: fb.y, transform: 'translate(-50%, -50%)' }}
                                >
                                    +{fb.value}
                                </div>
                            ))}
                        </div>

                        <p className="text-muted-foreground text-xs sm:text-sm mt-4 sm:mt-6">
                            {t("game.clicker.help")}
                        </p>

                        {gameState?.passive_income > 0 && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                {t("game.clicker.passiveEarning", { amount: gameState.passive_income })}
                            </p>
                        )}
                    </div>

                    {/* Upgrades Panel */}
                    <div className="lg:col-span-7 fade-in stagger-2">
                        <div className="stats-card h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    {t("game.upgrades.title")}
                                </h2>
                                <span className="text-xs text-muted-foreground">
                                    {t("game.upgrades.availableUsers", {
                                        amount: formatNumber(gameState?.current_users || 0),
                                    })}
                                </span>
                            </div>

                            <ScrollArea className="h-[420px] sm:h-[480px] pr-3">
                                {/* Click Upgrades */}
                                <section className="mb-5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-cyan-300">
                                            <MousePointer className="w-3.5 h-3.5" />
                                            {t("game.upgrades.clickPower")}
                                        </h3>
                                        <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                                            {t("game.upgrades.manualBoost")}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {clickUpgrades.map((upgrade, i) => (
                                            <UpgradeItem
                                                key={upgrade.id}
                                                upgrade={upgrade}
                                                onBuy={handleBuyUpgrade}
                                                buying={buyingUpgrade === upgrade.id}
                                                formatCost={formatCost}
                                                index={i}
                                                variant="click"
                                                t={t}
                                            />
                                        ))}
                                    </div>
                                </section>

                                {/* Passive Upgrades */}
                                <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-emerald-300">
                                            <Bot className="w-3.5 h-3.5" />
                                            {t("game.upgrades.passiveIncome")}
                                        </h3>
                                        <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                                            {t("game.upgrades.autoGain")}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {passiveUpgrades.map((upgrade, i) => (
                                            <UpgradeItem
                                                key={upgrade.id}
                                                upgrade={upgrade}
                                                onBuy={handleBuyUpgrade}
                                                buying={buyingUpgrade === upgrade.id}
                                                formatCost={formatCost}
                                                index={i}
                                                variant="passive"
                                                t ={t}
                                            />
                                        ))}
                                    </div>
                                </section>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

function UpgradeItem({ upgrade, onBuy, buying, formatCost, index, variant = "click", t }) {
    const isClick = variant === 'click';

    return (
        <div
            className={`
                upgrade-card flex items-center justify-between gap-3 rounded-lg border
                ${upgrade.can_afford ? 'can-afford' : ''}
                ${isClick
                    ? 'border-cyan-500/20 bg-cyan-500/5'
                    : 'border-emerald-500/20 bg-emerald-500/5'}
            `}
            data-testid={`upgrade-${upgrade.id}`}
            style={{
                animationDelay: `${index * 50}ms`,
                borderLeftWidth: '3px',
                borderLeftColor: isClick ? 'rgba(34,211,238,0.8)' : 'rgba(52,211,153,0.8)'
            }}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm sm:text-base truncate">{upgrade.name}</span>

                    <span
                        className={`
                            text-[10px] sm:text-xs px-2 py-0.5 rounded-full border
                            ${isClick
                                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}
                        `}
                    >
                        {isClick ? t("game.upgrades.typeClick") : t("game.upgrades.typePassive")}
                    </span>

                    {upgrade.level > 0 && (
                        <span className="level-badge text-xs flex items-center gap-0.5">
                            <ChevronUp className="w-3 h-3" />
                            {upgrade.level}
                        </span>
                    )}
                </div>

                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {upgrade.description}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right">
                    <div
                        className={`font-mono text-xs sm:text-sm ${upgrade.can_afford ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                    >
                        {formatCost(upgrade.cost)}
                    </div>
                </div>

                <Button
                    onClick={() => onBuy(upgrade.id, upgrade.name)}
                    disabled={!upgrade.can_afford || buying}
                    className={`
                        h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-sm btn-active
                        ${isClick
                            ? 'bg-cyan-400 text-black hover:bg-cyan-300'
                            : 'bg-emerald-400 text-black hover:bg-emerald-300'}
                        disabled:opacity-30 disabled:cursor-not-allowed
                    `}
                    data-testid={`buy-${upgrade.id}-btn`}
                >
                    {buying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        t("game.upgrades.buy")
                    )}
                </Button>
            </div>
        </div>
    );
}