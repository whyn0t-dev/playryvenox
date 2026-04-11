import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
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
    Star,
    LineChart,
    Swords,
} from "lucide-react";
import { Button } from "../components/ui/button";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation();
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
                    console.error("Unexpected leaderboard response format:", data);
                    setTopPlayers([]);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setTopPlayers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopPlayers();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B";
        if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
        if (num >= 1000) return (num / 1000).toFixed(2) + "K";
        return Math.floor(num).toLocaleString();
    };

    const topPlayer =
        Array.isArray(topPlayers) && topPlayers.length > 0 ? topPlayers[0] : null;

    return (
        <div className="min-h-screen">
            <section className="relative py-20 lg:py-32 overflow-hidden border-b border-border">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1639066648921-82d4500abf1a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2VydmVyJTIwcm9vbSUyMHRlY2h8ZW58MHx8fHwxNzc1Mzc3NzgzfDA&ixlib=rb-4.1.0&q=85)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-background" />
                </div>

                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-3xl rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-sm mb-8 backdrop-blur-sm">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary tracking-wide">
                                {t("home.hero.badge")}
                            </span>
                        </div>

                        <h1 className="hero-shine text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-none">
                            {t("home.hero.title.line1")}
                            <br />
                            <span className="text-primary">{t("home.hero.title.line2")}</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                            {t("home.hero.description")}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
                            <div className="px-4 py-2 bg-background/50 border border-border rounded-sm backdrop-blur-sm text-sm text-muted-foreground">
                                <span className="text-foreground font-semibold">
                                    {t("home.hero.feature1.title")}
                                </span>{" "}
                                • {t("home.hero.feature1.text")}
                            </div>
                            <div className="px-4 py-2 bg-background/50 border border-border rounded-sm backdrop-blur-sm text-sm text-muted-foreground">
                                <span className="text-foreground font-semibold">
                                    {t("home.hero.feature2.title")}
                                </span>{" "}
                                • {t("home.hero.feature2.text")}
                            </div>
                            <div className="px-4 py-2 bg-background/50 border border-border rounded-sm backdrop-blur-sm text-sm text-muted-foreground">
                                <span className="text-foreground font-semibold">
                                    {t("home.hero.feature3.title")}
                                </span>{" "}
                                • {t("home.hero.feature3.text")}
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
                                        {t("home.hero.cta.playNow")}
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
                                            {t("home.hero.cta.startBuilding")}
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button
                                            data-testid="login-btn"
                                            variant="outline"
                                            className="h-14 px-10 text-lg font-medium border-border hover:bg-secondary rounded-sm"
                                        >
                                            {t("home.hero.cta.login")}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            <div className="stats-card text-left">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                    <MousePointer className="w-4 h-4 text-primary" />
                                    {t("home.cards.simple.kicker")}
                                </div>
                                <div className="text-lg font-semibold mb-1">
                                    {t("home.cards.simple.title")}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t("home.cards.simple.description")}
                                </p>
                            </div>

                            <div className="stats-card text-left">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                    <Bot className="w-4 h-4 text-primary" />
                                    {t("home.cards.auto.kicker")}
                                </div>
                                <div className="text-lg font-semibold mb-1">
                                    {t("home.cards.auto.title")}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t("home.cards.auto.description")}
                                </p>
                            </div>

                            <div className="stats-card text-left">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                    <Trophy className="w-4 h-4 text-primary" />
                                    {t("home.cards.glory.kicker")}
                                </div>
                                <div className="text-lg font-semibold mb-1">
                                    {t("home.cards.glory.title")}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t("home.cards.glory.description")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-sm mb-4">
                            <Flame className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">
                                {t("home.why.badge")}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                            {t("home.why.title")}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            {t("home.why.description")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.why.items.progress.title1")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.why.items.progress.description1")}
                            </p>
                        </div>

                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.why.items.strategy.title2")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.why.items.strategy.description2")}
                            </p>
                        </div>

                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Crown className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.why.items.pressure.title3")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.why.items.pressure.description3")}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Rocket className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.why.items.progress.title4")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.why.items.progress.description4")}
                            </p>
                        </div>

                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <LineChart className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.why.items.strategy.title5")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.why.items.strategy.description5")}
                            </p>
                        </div>

                        <div className="stats-card">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-sm">
                                <Swords className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.why.items.pressure.title6")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.why.items.pressure.description6")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                            {t("home.how.title")}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            {t("home.how.description")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stats-card relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-5xl font-black text-primary/10">
                                01
                            </div>
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.how.step1.title")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.how.step1.description")}
                            </p>
                        </div>

                        <div className="stats-card relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-5xl font-black text-primary/10">
                                02
                            </div>
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.how.step2.title")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.how.step2.description")}
                            </p>
                        </div>

                        <div className="stats-card relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-5xl font-black text-primary/10">
                                03
                            </div>
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                                <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("home.how.step3.title")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("home.how.step3.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-sm mb-5">
                            <Star className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">
                                {t("home.guide.badge")}
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                            {t("home.guide.title")}
                        </h2>

                        <div className="space-y-5 text-muted-foreground text-base sm:text-lg leading-8">
                            <p>{t("home.guide.p1")}</p>
                            <p>{t("home.guide.p2")}</p>
                            <p>{t("home.guide.p3")}</p>
                            <p>{t("home.guide.p4")}</p>

                            <p>
                                {t("home.guide.links.intro")}{" "}
                                <Link to="/how-to-play" className="text-primary hover:underline font-medium">
                                    {t("home.guide.links.howToPlay")}
                                </Link>
                                , {t("home.guide.links.read")}{" "}
                                <Link to="/faq" className="text-primary hover:underline font-medium">
                                    {t("home.guide.links.faq")}
                                </Link>
                                , {t("home.guide.links.or")}{" "}
                                <Link to="/leaderboard" className="text-primary hover:underline font-medium">
                                    {t("home.guide.links.leaderboard")}
                                </Link>
                                . {t("home.guide.links.end")}{" "}
                                <Link to="/register" className="text-primary hover:underline font-medium">
                                    {t("home.guide.links.createAccount")}
                                </Link>{" "}
                                {t("home.guide.links.startNow")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                                {t("home.tips.title")}
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                                {t("home.tips.description")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="stats-card">
                                <h3 className="text-xl font-semibold mb-3">
                                    {t("home.tips.tip1.title")}
                                </h3>
                                <p className="text-muted-foreground leading-7">
                                    {t("home.tips.tip1.description")}
                                </p>
                            </div>

                            <div className="stats-card">
                                <h3 className="text-xl font-semibold mb-3">
                                    {t("home.tips.tip2.title")}
                                </h3>
                                <p className="text-muted-foreground leading-7">
                                    {t("home.tips.tip2.description")}
                                </p>
                            </div>

                            <div className="stats-card">
                                <h3 className="text-xl font-semibold mb-3">
                                    {t("home.tips.tip3.title")}
                                </h3>
                                <p className="text-muted-foreground leading-7">
                                    {t("home.tips.tip3.description")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-sm mb-3">
                                <Star className="w-4 h-4 text-primary" />
                                <span className="text-sm text-primary font-medium">
                                    {t("home.leaderboard.badge")}
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-primary" />
                                {t("home.leaderboard.title")}
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl">
                                {t("home.leaderboard.description")}
                            </p>
                        </div>

                        <Link to="/leaderboard">
                            <Button variant="outline" className="rounded-sm" data-testid="view-all-leaderboard-btn">
                                {t("home.leaderboard.viewAll")}
                            </Button>
                        </Link>
                    </div>

                    {topPlayer && !loading && (
                        <div className="stats-card mb-6 border-primary/30 bg-primary/5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                                        <Crown className="w-4 h-4" />
                                        {t("home.leaderboard.topFounder")}
                                    </div>
                                    <div className="text-2xl font-bold">{topPlayer.username}</div>
                                    <p className="text-muted-foreground mt-1">
                                        {t("home.leaderboard.topFounderStats", {
                                            users: formatNumber(topPlayer.total_users_generated),
                                            level: topPlayer.level,
                                        })}
                                    </p>
                                </div>
                                {!isAuthenticated && (
                                    <Link to="/register">
                                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active">
                                            {t("home.leaderboard.tryBeat")}
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
                                    <th className="w-20">{t("home.table.rank")}</th>
                                    <th>{t("home.table.player")}</th>
                                    <th className="text-right">{t("home.table.totalUsers")}</th>
                                    <th className="text-right w-24">{t("home.table.level")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                            {t("home.table.loading")}
                                        </td>
                                    </tr>
                                ) : !Array.isArray(topPlayers) || topPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                            {t("home.table.empty")}
                                        </td>
                                    </tr>
                                ) : (
                                    topPlayers.slice(0, 10).map((player) => (
                                        <tr key={player.rank} data-testid={`leaderboard-row-${player.rank}`}>
                                            <td
                                                className={`font-mono font-bold ${player.rank === 1
                                                    ? "rank-1"
                                                    : player.rank === 2
                                                        ? "rank-2"
                                                        : player.rank === 3
                                                            ? "rank-3"
                                                            : ""
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
                                                    {t("home.table.lvl")} {player.level}
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

            <section className="py-20 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                                {t("home.faq.title")}
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                {t("home.faq.description")}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="stats-card">
                                <h3 className="text-lg font-semibold mb-2">{t("home.faq.q1")}</h3>
                                <p className="text-muted-foreground leading-7">{t("home.faq.a1")}</p>
                            </div>

                            <div className="stats-card">
                                <h3 className="text-lg font-semibold mb-2">{t("home.faq.q2")}</h3>
                                <p className="text-muted-foreground leading-7">{t("home.faq.a2")}</p>
                            </div>

                            <div className="stats-card">
                                <h3 className="text-lg font-semibold mb-2">{t("home.faq.q3")}</h3>
                                <p className="text-muted-foreground leading-7">{t("home.faq.a3")}</p>
                            </div>

                            <div className="stats-card">
                                <h3 className="text-lg font-semibold mb-2">{t("home.faq.q4")}</h3>
                                <p className="text-muted-foreground leading-7">
                                    {t("home.faq.a4.intro")}{" "}
                                    <Link to="/how-to-play" className="text-primary hover:underline font-medium">
                                        {t("home.faq.a4.howToPlay")}
                                    </Link>{" "}
                                    {t("home.faq.a4.middle")}{" "}
                                    <Link to="/faq" className="text-primary hover:underline font-medium">
                                        {t("home.faq.a4.faq")}
                                    </Link>{" "}
                                    {t("home.faq.a4.end")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {!isAuthenticated && (
                <section className="py-20 border-t border-border">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center stats-card border-primary/20 bg-gradient-to-b from-primary/10 to-transparent">
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-sm mb-5">
                                <Rocket className="w-4 h-4 text-primary" />
                                <span className="text-sm text-primary font-medium">
                                    {t("home.finalCta.badge")}
                                </span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                                {t("home.finalCta.title")}
                            </h2>

                            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                                {t("home.finalCta.description")}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register">
                                    <Button
                                        data-testid="cta-start-playing-btn"
                                        className="h-12 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm btn-active"
                                    >
                                        {t("home.finalCta.start")}
                                    </Button>
                                </Link>

                                <Link to="/leaderboard">
                                    <Button
                                        variant="outline"
                                        className="h-12 px-8 text-lg font-medium rounded-sm"
                                    >
                                        {t("home.finalCta.seeCompetition")}
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