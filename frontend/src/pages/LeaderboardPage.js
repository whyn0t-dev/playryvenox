import { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useTranslation } from "react-i18next";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/leaderboard?page=${page}&limit=20`);
      const data = response.data;

      if (data && Array.isArray(data.players)) {
        setPlayers(data.players);
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setPlayers(data);
        setTotalPages(1);
        setTotal(data.length);
      } else {
        console.error("Unexpected leaderboard response format:", data);
        setPlayers([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setPlayers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [page]);

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    return Math.floor(num).toLocaleString();
  };

  return (
    <div className="min-h-screen py-8 px-4" data-testid="leaderboard-page">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {t("leaderboard.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("leaderboard.subtitle", { total })}
          </p>
          <Button
            variant="outline"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="rounded-sm mt-4"
          >
            Actualiser
          </Button>
        </div>

        <div className="stats-card overflow-hidden p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !Array.isArray(players) || players.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {t("leaderboard.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="leaderboard-table leaderboard-table-large"
                data-testid="leaderboard-table"
              >
                <thead>
                  <tr>
                    <th className="w-28">{t("leaderboard.table.rank")}</th>
                    <th>{t("leaderboard.table.player")}</th>
                    <th className="text-right">{t("leaderboard.table.totalUsers")}</th>
                    <th className="text-right w-32">{t("leaderboard.table.level")}</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(
                    (player) =>
                      player && (
                        <tr key={player.rank} data-testid={`leaderboard-row-${player.rank}`}>
                          <td
                            className={`font-mono font-bold text-xl ${player.rank === 1
                              ? "rank-1"
                              : player.rank === 2
                                ? "rank-2"
                                : player.rank === 3
                                  ? "rank-3"
                                  : ""
                              }`}
                          >
                            {player.rank === 1 && "🥇 "}
                            {player.rank === 2 && "🥈 "}
                            {player.rank === 3 && "🥉 "}
                            #{player.rank}
                          </td>
                          <td className="font-semibold text-xl">{player.username}</td>
                          <td className="text-right font-mono text-xl">
                            {formatNumber(player.total_users_generated)}
                          </td>
                          <td className="text-right">
                            <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold text-base border border-primary/20">
                              {t("leaderboard.table.lvl")} {player.level}
                            </span>
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {t("leaderboard.pagination.pageOf", { page, totalPages })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-sm"
                  data-testid="prev-page-btn"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t("leaderboard.pagination.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-sm"
                  data-testid="next-page-btn"
                >
                  {t("leaderboard.pagination.next")}
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