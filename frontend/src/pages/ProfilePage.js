import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { User, Trophy, Users, MousePointer, Bot, TrendingUp, Calendar, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API}/profile`);
                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toLocaleString();
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'Unknown') return 'Unknown';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4" data-testid="profile-page">
            <div className="container mx-auto max-w-3xl">
                {/* Profile Header */}
                <div className="stats-card mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" data-testid="profile-username">
                                {profile?.username || user?.username}
                            </h1>
                            <p className="text-muted-foreground" data-testid="profile-email">
                                {profile?.email || user?.email}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary font-medium">
                                    Level {profile?.level || 1}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Trophy className="w-4 h-4" />
                                    Rank #{profile?.rank || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="stats-card" data-testid="profile-current-users">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <Users className="w-4 h-4" />
                            <span>Current Users</span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-glow">
                            {formatNumber(profile?.current_users || 0)}
                        </div>
                    </div>

                    <div className="stats-card" data-testid="profile-total-users">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Total Generated</span>
                        </div>
                        <div className="text-3xl font-mono font-bold">
                            {formatNumber(profile?.total_users_generated || 0)}
                        </div>
                    </div>

                    <div className="stats-card" data-testid="profile-click-power">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <MousePointer className="w-4 h-4" />
                            <span>Click Power</span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-primary">
                            +{profile?.click_power || 1}
                        </div>
                    </div>

                    <div className="stats-card" data-testid="profile-passive-income">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <Bot className="w-4 h-4" />
                            <span>Passive Income</span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-green-400">
                            +{profile?.passive_income || 0}/s
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="stats-card">
                    <h2 className="text-lg font-bold mb-4">Account Details</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                Global Rank
                            </span>
                            <span className="font-mono font-bold" data-testid="profile-rank">
                                #{profile?.rank || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Total Upgrades Purchased</span>
                            <span className="font-mono font-bold" data-testid="profile-total-upgrades">
                                {profile?.total_upgrades || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Member Since
                            </span>
                            <span className="font-medium" data-testid="profile-created-at">
                                {formatDate(profile?.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
