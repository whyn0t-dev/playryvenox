import "@/App.css";
import "@/i18n";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GamePage from "./pages/GamePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import AuthConfirmPage from "./pages/AuthPageConfirm";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import HowToPlay from "./pages/HowToPlay";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import LegalNoticePage from "./pages/LegalNoticePage";
import Footer from "./components/Footer";
import GlobalAudio from "./components/GlobalAudio";

import BasePage from "./pages/BasePage"

function App() {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const savedSound = localStorage.getItem("soundEnabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("soundEnabled", String(next));
      return next;
    });
  };

  return (
    <AuthProvider>
      <div className="App min-h-screen bg-background text-foreground">
        <div className="app-background" />
        <BrowserRouter>
          <Navbar soundEnabled={soundEnabled} toggleSound={toggleSound} />

          <main>
            <GlobalAudio enabled={soundEnabled} />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/auth/confirm" element={<AuthConfirmPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/legal-notice" element={<LegalNoticePage />} />
              <Route
                path="/base"
                element={
                  <ProtectedRoute>
                    <BasePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/game"
                element={
                  <ProtectedRoute>
                    <GamePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </BrowserRouter>

        <Toaster position="bottom-right" />
      </div>
    </AuthProvider>
  );
}

export default App;