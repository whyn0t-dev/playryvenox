import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

export default function AuthConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [title, setTitle] = useState("Vérification en cours...");
  const [message, setMessage] = useState(
    "Nous vérifions votre lien de confirmation."
  );

  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");
        const type = params.get("type");

        if (!token_hash || !type) {
          setStatus("error");
          setTitle("Lien invalide");
          setMessage(
            "Le lien de confirmation est incomplet ou incorrect. Vous pouvez demander un nouvel email de confirmation ci-dessous."
          );
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          setStatus("error");
          setTitle("Lien expiré ou invalide");
          setMessage(
            "Ce lien de confirmation ne fonctionne plus. Entrez votre adresse email pour recevoir un nouveau lien."
          );
          return;
        }

        setStatus("success");
        setTitle("Compte confirmé avec succès");
        setMessage(
          "Votre compte a bien été validé. Vous pouvez maintenant vous connecter."
        );
      } catch (err) {
        console.error("Erreur lors de la confirmation :", err);
        setStatus("error");
        setTitle("Une erreur est survenue");
        setMessage(
          "Impossible de confirmer votre compte pour le moment. Vous pouvez demander un nouvel email de confirmation."
        );
      }
    };

    run();
  }, []);

  const handleGoToLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleResendConfirmation = async (e) => {
    e.preventDefault();
    setResendMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setResendMessage("Veuillez saisir votre adresse email.");
      return;
    }

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        setResendMessage(
          "Impossible d'envoyer le nouvel email de confirmation. Vérifiez l'adresse email et réessayez."
        );
        return;
      }

      setResendMessage(
        "Un nouvel email de confirmation a été envoyé. Vérifiez votre boîte de réception ainsi que vos spams."
      );
    } catch (err) {
      console.error("Erreur lors du renvoi de l'email :", err);
      setResendMessage(
        "Une erreur est survenue pendant l'envoi. Veuillez réessayer."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          textAlign: "center",
          padding: "32px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.03)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            opacity: 0.85,
            marginBottom: "24px",
          }}
        >
          {message}
        </p>

        {status === "loading" && (
          <div
            style={{
              fontSize: "0.95rem",
              opacity: 0.7,
            }}
          >
            Chargement...
          </div>
        )}

        {status === "success" && (
          <button
            onClick={handleGoToLogin}
            style={{
              padding: "12px 20px",
              fontSize: "1rem",
              fontWeight: 600,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#ffffff",
              color: "#111111",
            }}
          >
            Continuer vers la connexion
          </button>
        )}

        {status === "error" && (
          <form
            onSubmit={handleResendConfirmation}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
                color: "#ffffff",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <button
              type="submit"
              disabled={resending}
              style={{
                padding: "12px 20px",
                fontSize: "1rem",
                fontWeight: 600,
                border: "none",
                borderRadius: "8px",
                cursor: resending ? "not-allowed" : "pointer",
                background: "#ffffff",
                color: "#111111",
                opacity: resending ? 0.7 : 1,
              }}
            >
              {resending
                ? "Envoi en cours..."
                : "Renvoyer l'email de confirmation"}
            </button>

            {resendMessage && (
              <p
                style={{
                  marginTop: "4px",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  opacity: 0.9,
                }}
              >
                {resendMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleGoToLogin}
              style={{
                padding: "10px 16px",
                fontSize: "0.95rem",
                fontWeight: 500,
                borderRadius: "8px",
                cursor: "pointer",
                background: "transparent",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.15)",
                marginTop: "8px",
              }}
            >
              Retour à la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}