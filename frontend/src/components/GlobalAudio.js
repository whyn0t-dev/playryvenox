import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function GlobalAudio({ enabled }) {
  const audioRef = useRef(null);
  const location = useLocation();

  const getMusicByRoute = (pathname) => {
    if (pathname === "/") return "/sounds/music.mp3";
    if (pathname === "/game") return "/sounds/music.mp3";
    if (pathname === "/leaderboard") return "/sounds/music.mp3";
    return null;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const musicSrc = getMusicByRoute(location.pathname);

    // Stop si désactivé
    if (!enabled || !musicSrc) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    // Change musique seulement si différente
    const fullSrc = window.location.origin + musicSrc;
    if (audio.src !== fullSrc) {
      audio.src = musicSrc;
      audio.load();
    }

    // Fade-in 🔥
    audio.volume = 0;
    let volume = 0;
    const target = 0.25;

    const fade = setInterval(() => {
      if (volume < target) {
        volume += 0.02;
        audio.volume = volume;
      } else {
        clearInterval(fade);
      }
    }, 100);

    audio.play().catch(() => {});

    return () => clearInterval(fade);
  }, [enabled, location.pathname]);

  return <audio ref={audioRef} loop preload="auto" />;
}