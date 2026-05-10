import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import {
    User,
    Trophy,
    Users,
    MousePointer,
    Bot,
    TrendingUp,
    Calendar,
    Loader2,
    Zap,
    Shield,
    Skull,
    ChevronRight,
    Sparkles,
    BarChart3,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import DailyBonus from '../components/DailyBonus';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const getAuthHeaders = useCallback(async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error(t('profile.session.noActive'));
        }

        return {
            Authorization: `Bearer ${session.access_token}`,
        };
    }, [t]);

    const fetchProfile = useCallback(async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API}/profile`, { headers });
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const formatNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num || 0).toLocaleString();
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'Unknown') return t('profile.date.unknown');

        try {
            return new Date(dateStr).toLocaleDateString(
                i18n.language === 'fr' ? 'fr-FR' : 'en-US',
                {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }
            );
        } catch {
            return t('profile.date.unknown');
        }
    };

    const handleDailyClaim = () => {
        fetchProfile();
    };

    const handleDeleteProfile = async () => {
        const confirmed = window.confirm(t('profile.delete.confirm'));

        if (!confirmed || deleting) return;

        setDeleting(true);

        try {
            const headers = await getAuthHeaders();
            await axios.delete(`${API}/profile`, { headers });

            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error deleting profile:', error);
            alert(error.response?.data?.detail || t('profile.delete.error'));
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Profile – Ryvenox</title>
                    <meta name="robots" content="noindex, follow" />
                </Helmet>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </>
        );
    }

    const username = profile?.username || user?.username;
    const email = profile?.email || user?.email;
    const level = profile?.level || 1;
    const currentUsers = profile?.current_users || 0;
    const totalGenerated = profile?.total_users_generated || 0;
    const clickPower = profile?.click_power || 1;
    const passiveIncome = profile?.passive_income || 0;
    const totalUpgrades = profile?.total_upgrades || 0;
    const rank = profile?.rank;
    const createdAt = profile?.created_at;

    return (
        <>
            <Helmet>
                <title>Profile – Ryvenox</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>

            <div className="min-h-screen py-8 px-4" data-testid="profile-page">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex justify-end mb-4">
                        <DailyBonus onClaim={handleDailyClaim} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 space-y-6">
                            <div className="relative overflow-hidden rounded-sm border border-border bg-card">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-yellow-500/10 pointer-events-none" />

                                <div className="relative p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-sm shadow-lg">
                                                <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h1
                                                        className="text-3xl sm:text-4xl font-bold tracking-tight"
                                                        data-testid="profile-username"
                                                    >
                                                        {username}
                                                    </h1>

                                                    <span className="px-3 py-1 rounded-sm text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                                        {t('profile.level', { level })}
                                                    </span>

                                                    <span className="px-3 py-1 rounded-sm text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" />
                                                            {rank
                                                                ? t('profile.rank', { rank })
                                                                : t('profile.rankFallback')}
                                                        </span>
                                                    </span>
                                                </div>

                                                <p
                                                    className="text-muted-foreground mb-3 break-all"
                                                    data-testid="profile-email"
                                                >
                                                    {email}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="inline-flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {t('profile.memberSince')} {formatDate(createdAt)}
                                                    </span>

                                                    <span className="inline-flex items-center gap-2">
                                                        <Trophy className="w-4 h-4" />
                                                        {t('profile.globalRank')} {rank ? `#${rank}` : '#-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 min-w-[220px]">
                                            <div className="rounded-sm border border-border bg-background/50 p-4">
                                                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                                    {t('profile.stats.currentUsers')}
                                                </div>
                                                <div className="text-2xl font-bold font-mono text-glow">
                                                    {formatNumber(currentUsers)}
                                                </div>
                                            </div>

                                            <div className="rounded-sm border border-border bg-background/50 p-4">
                                                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                                    {t('profile.stats.totalGenerated')}
                                                </div>
                                                <div className="text-2xl font-bold font-mono">
                                                    {formatNumber(totalGenerated)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                <div className="rounded-sm border border-border bg-card p-5" data-testid="profile-current-users">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-muted-foreground">
                                            {t('profile.stats.currentUsers')}
                                        </span>
                                        <Users className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-3xl font-mono font-bold text-glow">
                                        {formatNumber(currentUsers)}
                                    </div>
                                </div>

                                <div className="rounded-sm border border-border bg-card p-5" data-testid="profile-total-users">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-muted-foreground">
                                            {t('profile.stats.totalGenerated')}
                                        </span>
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-3xl font-mono font-bold">
                                        {formatNumber(totalGenerated)}
                                    </div>
                                </div>

                                <div className="rounded-sm border border-border bg-card p-5" data-testid="profile-click-power">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-muted-foreground">
                                            {t('profile.stats.clickPower')}
                                        </span>
                                        <MousePointer className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-3xl font-mono font-bold text-primary">
                                        {t('profile.clickPowerValue', { amount: clickPower })}
                                    </div>
                                </div>

                                <div className="rounded-sm border border-border bg-card p-5" data-testid="profile-passive-income">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-muted-foreground">
                                            {t('profile.stats.passiveIncome')}
                                        </span>
                                        <Bot className="w-4 h-4 text-green-400" />
                                    </div>
                                    <div className="text-3xl font-mono font-bold text-green-400">
                                        {t('profile.passiveIncomePerSecond', { amount: passiveIncome })}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-sm border border-border bg-card p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-bold">{t('profile.detailedStats')}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="rounded-sm border border-border bg-background/40 p-4">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {t('profile.globalRank')}
                                        </div>
                                        <div className="text-2xl font-bold font-mono" data-testid="profile-rank">
                                            {rank ? `#${rank}` : '#-'}
                                        </div>
                                    </div>

                                    <div className="rounded-sm border border-border bg-background/40 p-4">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {t('profile.totalUpgradesPurchased')}
                                        </div>
                                        <div className="text-2xl font-bold font-mono" data-testid="profile-total-upgrades">
                                            {totalUpgrades}
                                        </div>
                                    </div>

                                    <div className="rounded-sm border border-border bg-background/40 p-4">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {t('profile.stats.clickPower')}
                                        </div>
                                        <div className="text-2xl font-bold font-mono text-primary">
                                            {t('profile.clickPowerValue', { amount: clickPower })}
                                        </div>
                                    </div>

                                    <div className="rounded-sm border border-border bg-background/40 p-4">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {t('profile.stats.passiveIncome')}
                                        </div>
                                        <div className="text-2xl font-bold font-mono text-green-400">
                                            {t('profile.passiveIncomePerSecond', { amount: passiveIncome })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-sm border border-border bg-card p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-bold">{t('profile.accountPanel')}</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
                                        <span className="text-muted-foreground">{t('profile.memberSince')}</span>
                                        <span className="font-medium text-right">{formatDate(createdAt)}</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
                                        <span className="text-muted-foreground">{t('profile.globalRank')}</span>
                                        <span className="font-mono font-bold">{rank ? `#${rank}` : '#-'}</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
                                        <span className="text-muted-foreground">{t('profile.totalUpgradesPurchased')}</span>
                                        <span className="font-mono font-bold">{totalUpgrades}</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 py-3">
                                        <span className="text-muted-foreground">{t('profile.levelLabel')}</span>
                                        <span className="font-mono font-bold">{level}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Skull className="w-5 h-5 text-destructive" />
                                    <h2 className="text-xl font-bold text-destructive">
                                        {t('profile.dangerZone')}
                                    </h2>
                                </div>

                                <p className="text-sm text-muted-foreground mb-5">
                                    {t('profile.delete.description')}
                                </p>

                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteProfile}
                                    disabled={deleting}
                                    className="w-full rounded-sm"
                                    data-testid="profile-delete-btn"
                                >
                                    {deleting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('profile.delete.loading')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Skull className="w-4 h-4" />
                                            {t('profile.delete.button')}
                                            <ChevronRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}