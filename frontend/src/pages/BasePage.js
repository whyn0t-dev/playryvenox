import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { API_URL } from "../lib/utils";
import Base3D from "../components/Base3D";

export default function BasePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState("generator");
  const [error, setError] = useState("");

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
    try {
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
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Error loading base</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-4 text-3xl font-bold">🏗 Base</h1>

      {error && (
        <div className="mb-4 rounded border border-red-500 bg-red-500/10 px-4 py-2 text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 space-y-2">
        <p>Users: {data.player.current_users}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedBuilding("generator")}
          className={`rounded border px-4 py-2 ${
            selectedBuilding === "generator" ? "bg-primary text-white" : ""
          }`}
        >
          Generator ({data.building_costs.generator})
        </button>

        <button
          onClick={() => setSelectedBuilding("storage")}
          className={`rounded border px-4 py-2 ${
            selectedBuilding === "storage" ? "bg-primary text-white" : ""
          }`}
        >
          Storage ({data.building_costs.storage})
        </button>

        <button
          onClick={() => setSelectedBuilding("wall")}
          className={`rounded border px-4 py-2 ${
            selectedBuilding === "wall" ? "bg-primary text-white" : ""
          }`}
        >
          Wall ({data.building_costs.wall})
        </button>
      </div>

      <h2 className="mb-3 text-xl font-semibold">Base 3D</h2>

      <div className="h-[600px] w-full overflow-hidden rounded border">
        <Base3D
          data={data}
          onBuild={(x, y) => build(selectedBuilding, x, y)}
        />
      </div>
    </div>
  );
}