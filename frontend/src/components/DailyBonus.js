import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Gift, Clock, Flame, Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DailyBonus({ onClaim }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const getAuthHeaders = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error('No active session');
        }

        return {
            Authorization: `Bearer ${session.access_token}`,
        };
    };

    const fetchStatus = useCallback(async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API}/daily/status`, { headers });
            setStatus(response.data);
            setCountdown(response.data.seconds_until_available);
        } catch (error) {
            console.error('Error fetching daily status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchStatus();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, fetchStatus]);

    const handleClaim = async () => {
        if (claiming || !status?.available) return;

        setClaiming(true);
        try {
            const headers = await getAuthHeaders();
            const response = await axios.post(`${API}/daily/claim`, {}, { headers });

            if (response.data.success) {
                toast.success(
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <div>
                            <div className="font-bold">Daily Bonus Claimed!</div>
                            <div className="text-sm opacity-80">+{response.data.reward.toLocaleString()} users</div>
                        </div>
                    </div>,
                    { duration: 4000 }
                );

                setShowModal(false);
                await fetchStatus();

                if (onClaim) {
                    onClaim(response.data.reward);
                }
            }
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to claim bonus';
            toast.error(message);
        } finally {
            setClaiming(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m ${secs}s`;
    };

    if (loading) return null;

    const streakDays = Array.from({ length: status?.max_streak || 7 }, (_, i) => i + 1);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-sm transition-all duration-200 ${
                    status?.available
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 hover:border-yellow-400 text-yellow-400 glow-pulse-gold'
                        : 'bg-secondary/50 border border-border hover:border-muted-foreground text-muted-foreground'
                }`}
                data-testid="daily-bonus-button"
            >
                <Gift className={`w-5 h-5 ${status?.available ? 'animate-bounce' : ''}`} />
                <span className="font-medium text-sm">
                    {status?.available ? 'Claim!' : formatTime(countdown)}
                </span>
                {status?.available && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                )}
            </button>

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in"
                    data-testid="daily-bonus-modal"
                    onClick={() => setShowModal(false)}
                >
                    <div className="relative w-full max-w-md bg-card border border-border rounded-sm p-6 slide-in-right" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10 p-1"
                            data-testid="daily-bonus-close-btn"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                status?.available
                                    ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50'
                                    : 'bg-muted border border-border'
                            }`}>
                                <Gift className={`w-8 h-8 ${status?.available ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                            </div>
                            <h2 className="text-2xl font-bold">Daily Bonus</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Come back every day for bigger rewards!
                            </p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                    Streak
                                </span>
                                <span className="text-sm font-mono">
                                    Day {status?.available ? status?.next_streak : status?.current_streak} / {status?.max_streak}
                                </span>
                            </div>

                            <div className="flex gap-1">
                                {streakDays.map((day) => {
                                    const isCompleted = day <= (status?.current_streak || 0);
                                    const isNext = day === (status?.next_streak || 1) && status?.available;
                                    const isCurrent = day === (status?.current_streak || 0) && !status?.available;

                                    return (
                                        <div
                                            key={day}
                                            className={`flex-1 h-2 rounded-full transition-all ${
                                                isCompleted
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                                    : isNext
                                                    ? 'bg-yellow-500/50 animate-pulse'
                                                    : isCurrent
                                                    ? 'bg-primary/50'
                                                    : 'bg-muted'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className={`p-4 rounded-sm mb-6 ${
                            status?.available
                                ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30'
                                : 'bg-muted/50 border border-border'
                        }`}>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">
                                    {status?.available ? "Today's Reward" : 'Next Reward'}
                                </div>
                                <div className={`text-3xl font-bold font-mono ${
                                    status?.available ? 'text-yellow-400 text-glow-gold' : 'text-foreground'
                                }`}>
                                    +{(status?.next_reward || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">users</div>
                            </div>
                        </div>

                        {status?.available ? (
                            <Button
                                onClick={handleClaim}
                                disabled={claiming}
                                className="w-full h-12 font-bold text-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 rounded-sm btn-active"
                                data-testid="claim-daily-btn"
                            >
                                {claiming ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                        Claiming...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Gift className="w-5 h-5" />
                                        Claim Bonus
                                        <ChevronRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        ) : (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                                    <Clock className="w-5 h-5" />
                                    <span>Next bonus available in</span>
                                </div>
                                <div className="text-2xl font-mono font-bold text-foreground">
                                    {formatTime(countdown)}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                            Total bonuses claimed: <span className="font-mono text-foreground">{status?.total_claims || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .glow-pulse-gold {
                    animation: glow-pulse-gold 2s ease-in-out infinite;
                }
                @keyframes glow-pulse-gold {
                    0%, 100% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.3); }
                    50% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.5); }
                }
                .text-glow-gold {
                    text-shadow: 0 0 10px rgba(234, 179, 8, 0.5), 0 0 20px rgba(234, 179, 8, 0.3);
                }
            `}</style>
        </>
    );
}