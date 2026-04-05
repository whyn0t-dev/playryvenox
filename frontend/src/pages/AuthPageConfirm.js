import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthConfirmPage() {
  const [message, setMessage] = useState("Vérification en cours...");
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token_hash = params.get("token_hash");
      const type = params.get("type");
      const redirect_to = params.get("redirect_to") || "/";

      if (!token_hash || !type) {
        setMessage("Lien invalide.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });

      if (error) {
        setMessage("Lien expiré ou invalide.");
        return;
      }

      setMessage("Compte confirmé. Redirection...");
      navigate(redirect_to, { replace: true });
    };

    run();
  }, [navigate]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
}