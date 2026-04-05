import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LeaderboardPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API}/leaderboard?page=${page}&limit=20`);
                setPlayers(response.data.players);
                setTotalPages(response.data.pages);
                setTotal(response.data.total);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [page]);

    const formatNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toLocaleString();
    };

    return (
        <div className="min-h-screen py-8 px-4" data-testid="leaderboard-page">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 mb-4">
                        <Trophy className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                        Global Leaderboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {total} players competing worldwide
                    </p>
                </div>

                {/* Leaderboard Table */}
                <div className="stats-card overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : players.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            No players yet. Be the first to join!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="leaderboard-table" data-testid="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th className="w-20">Rank</th>
                                        <th>Player</th>
                                        <th className="text-right">Total Users</th>
                                        <th className="text-right w-24">Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map((player) => (
                                        <tr key={player.rank} data-testid={`leaderboard-row-${player.rank}`}>
                                            <td className={`font-mono font-bold text-lg ${
                                                player.rank === 1 ? 'rank-1' : 
                                                player.rank === 2 ? 'rank-2' : 
                                                player.rank === 3 ? 'rank-3' : ''
                                            }`}>
                                                {player.rank === 1 && '🥇 '}
                                                {player.rank === 2 && '🥈 '}
                                                {player.rank === 3 && '🥉 '}
                                                #{player.rank}
                                            </td>
                                            <td className="font-medium text-lg">{player.username}</td>
                                            <td className="text-right font-mono text-lg">
                                                {formatNumber(player.total_users_generated)}
                                            </td>
                                            <td className="text-right">
                                                <span className="px-3 py-1 bg-primary/10 text-primary font-medium">
                                                    LVL {player.level}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-border">
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-sm"
                                    data-testid="prev-page-btn"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-sm"
                                    data-testid="next-page-btn"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
