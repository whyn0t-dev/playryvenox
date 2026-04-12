import { useEffect, useState } from "react";
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
            "⚠️ Reset base ? Users spent will NOT be refunded."
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
                            Loading base...
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
                        Error loading base
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white">
                            🏗 Base
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Build and organize your empire base in 3D.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-lg backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Rotation
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                            {rotation}°{" "}
                            <span className="text-sm font-normal text-slate-400">(R)</span>
                        </p>
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
                            Users
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">
                            {data.player.current_users}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Selected
                        </p>
                        <p className="mt-2 text-2xl font-bold capitalize text-white">
                            {selectedBuilding}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Cost
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">
                            {data.building_costs[selectedBuilding]}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur lg:sticky lg:top-6">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-white">
                                    Building Selection
                                </h2>
                                <p className="text-sm text-slate-400">
                                    Choose a structure, then click on a tile to place it.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setSelectedBuilding("generator")}
                                    disabled={loadingAction}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${selectedBuilding === "generator"
                                        ? "border-emerald-400/40 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700"
                                        }`}
                                >
                                    <span>Generator</span>
                                    <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                                        {data.building_costs.generator}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setSelectedBuilding("storage")}
                                    disabled={loadingAction}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${selectedBuilding === "storage"
                                        ? "border-blue-400/40 bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                        : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700"
                                        }`}
                                >
                                    <span>Storage</span>
                                    <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                                        {data.building_costs.storage}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setSelectedBuilding("wall")}
                                    disabled={loadingAction}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${selectedBuilding === "wall"
                                        ? "border-slate-400/40 bg-slate-600 text-white shadow-lg shadow-slate-500/20"
                                        : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700"
                                        }`}
                                >
                                    <span>Wall</span>
                                    <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                                        {data.building_costs.wall}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setSelectedBuilding("defense_tower")}
                                    disabled={loadingAction}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${selectedBuilding === "defense_tower"
                                            ? "border-orange-400/40 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                            : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700"
                                        }`}
                                >
                                    <span>Defense Tower</span>
                                    <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                                        {data.building_costs.defense_tower}
                                    </span>
                                </button>
                            </div>

                            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    Current selection
                                </p>
                                <p className="mt-2 text-lg font-semibold capitalize text-white">
                                    {selectedBuilding}
                                </p>
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
                                    {loadingAction ? "Please wait..." : "Reset Base"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur">
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Base 3D</h2>
                                <p className="text-sm text-slate-400">
                                    Rotate with the mouse, zoom in and out, press R to rotate previews.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
                                Current:{" "}
                                <span className="font-semibold capitalize text-white">
                                    {selectedBuilding}
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