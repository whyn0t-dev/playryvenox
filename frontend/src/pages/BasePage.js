import { useEffect, useState } from "react";
import {
    Boxes,
    Shield,
    TowerControl,
    Helicopter,
    Zap,
    Users,
    Wrench,
    RotateCw,
    Coins,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { API_URL } from "../lib/utils";
import Base3D from "../components/Base3D";

export default function BasePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBuilding, setSelectedBuilding] = useState("generator");
    const [error, setError] = useState("");
    const [loadingAction, setLoadingAction] = useState(false);
    const [rotation, setRotation] = useState(0);

    const formatNumber = (value) => {
        const num = Number(value);

        if (!Number.isFinite(num)) return "0";

        if (Math.abs(num) >= 1_000_000_000) {
            return `${(num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1)}B`;
        }

        if (Math.abs(num) >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
        }

        if (Math.abs(num) >= 1_000) {
            return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
        }

        if (!Number.isInteger(num)) {
            return num.toFixed(2);
        }

        return num.toLocaleString("fr-FR");
    };

    const buildingMeta = {
        generator: {
            label: "Générateur",
            icon: Zap,
            activeClass:
                "border-emerald-400/40 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
        },
        storage: {
            label: "Stockage",
            icon: Boxes,
            activeClass:
                "border-blue-400/40 bg-blue-500 text-white shadow-lg shadow-blue-500/20",
        },
        wall: {
            label: "Murs",
            icon: Shield,
            activeClass:
                "border-slate-400/40 bg-slate-600 text-white shadow-lg shadow-slate-500/20",
        },
        defense_tower: {
            label: "Tour de défense",
            icon: TowerControl,
            activeClass:
                "border-orange-400/40 bg-orange-500 text-white shadow-lg shadow-orange-500/20",
        },
        helicopter: {
            label: "Hélicoptère",
            icon: Helicopter,
            activeClass:
                "border-lime-400/40 bg-lime-500 text-white shadow-lg shadow-lime-500/20",
        },
    };

    const fetchBase = async () => {
        try {
            setError("");

            const {
                data: { session },
            } = await supabase.auth.getSession();

            const token = session?.access_token;

            const res = await fetch(`${API_URL}/api/base/state`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.detail || "Failed to load base");
            }

            setData(json);
        } catch (err) {
            console.error(err);
            setError(err.message || "Error loading base");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBase();
    }, []);

    const build = async (type, x, y) => {
        if (loadingAction) return;

        try {
            setLoadingAction(true);
            setError("");

            const {
                data: { session },
            } = await supabase.auth.getSession();

            const token = session?.access_token;

            const res = await fetch(`${API_URL}/api/base/build`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    building_type: type,
                    x,
                    y,
                    rotation,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.detail || "Build failed");
            }

            await fetchBase();
        } catch (err) {
            console.error(err);
            setError(err.message || "Build error");
        } finally {
            setLoadingAction(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === "r") {
                setRotation((prev) => (prev + 90) % 360);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const resetBase = async () => {
        if (loadingAction) return;

        const confirmed = confirm(
            "⚠️ Réinitialiser la base ? Les ressources dépensées ne seront PAS remboursées."
        );
        if (!confirmed) return;

        try {
            setLoadingAction(true);
            setError("");

            const {
                data: { session },
            } = await supabase.auth.getSession();

            const token = session?.access_token;

            const res = await fetch(`${API_URL}/api/base/reset`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.detail || "Reset failed");
            }

            await fetchBase();
        } catch (err) {
            console.error(err);
            setError(err.message || "Reset error");
        } finally {
            setLoadingAction(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
                        <div className="animate-pulse text-lg font-medium text-slate-300">
                            Chargement de votre base en cours...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300 shadow-2xl">
                        Erreur de chargement de la base. Veuillez réessayer plus tard.
                    </div>
                </div>
            </div>
        );
    }

    const SelectedBuildingIcon =
        buildingMeta[selectedBuilding]?.icon || Wrench;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white">
                            🏗 Votre base
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Construisez et organisez votre base d'empire en 3D.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-lg backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Rotation
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
                            <RotateCw className="h-5 w-5 text-slate-300" />
                            <span>
                                {rotation}°{" "}
                                <span className="text-sm font-normal text-slate-400">
                                    (R)
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 shadow-lg">
                        {error}
                    </div>
                )}

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Utilisateurs actuels
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <Users className="h-6 w-6 text-cyan-400" />
                            <p className="text-2xl font-bold text-white">
                                {formatNumber(data.player.current_users)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Bâtiment sélectionné
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <SelectedBuildingIcon className="h-6 w-6 text-violet-400" />
                            <p className="text-2xl font-bold capitalize text-white">
                                {buildingMeta[selectedBuilding]?.label || selectedBuilding}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Coût de construction
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <Coins className="h-6 w-6 text-yellow-400" />
                            <p className="text-2xl font-bold text-white">
                                {formatNumber(data.building_costs[selectedBuilding])}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur lg:sticky lg:top-6">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-white">
                                    Sélection du bâtiment
                                </h2>
                                <p className="text-sm text-slate-400">
                                    Choisissez une structure, puis cliquez sur une tuile pour la placer.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {Object.entries(buildingMeta).map(([key, meta]) => {
                                    const Icon = meta.icon;
                                    const isSelected = selectedBuilding === key;

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedBuilding(key)}
                                            disabled={loadingAction}
                                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                isSelected
                                                    ? meta.activeClass
                                                    : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                {meta.label}
                                            </span>
                                            <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                                                {formatNumber(data.building_costs[key])}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    Sélection actuelle
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                                    <SelectedBuildingIcon className="h-5 w-5 text-violet-400" />
                                    <span>
                                        {buildingMeta[selectedBuilding]?.label || selectedBuilding}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">
                                    Rotation: {rotation}°
                                </p>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={resetBase}
                                    disabled={loadingAction}
                                    className="w-full rounded-xl border border-red-500/30 bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loadingAction ? "Veuillez patienter..." : "Réinitialiser la base"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur">
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Base 3D</h2>
                                <p className="text-sm text-slate-400">
                                    Tournez avec la souris, zoomez, appuyez sur R pour faire tourner les prévisualisations.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
                                <span className="flex items-center gap-2">
                                    <SelectedBuildingIcon className="h-4 w-4 text-violet-400" />
                                    Actuel :{" "}
                                    <span className="font-semibold text-white">
                                        {buildingMeta[selectedBuilding]?.label || selectedBuilding}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="h-[600px] w-full bg-slate-950">
                            <Base3D
                                data={data}
                                onBuild={(x, y) => build(selectedBuilding, x, y)}
                                selectedBuildingType={selectedBuilding}
                                selectedRotation={rotation}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}