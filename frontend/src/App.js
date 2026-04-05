import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-background text-foreground">
        <div className="app-background" />
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/auth/confirm" element={<AuthConfirmPage />} />

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
        </BrowserRouter>
        <Toaster position="bottom-right" />
      </div>
    </AuthProvider>
  );
}

export default App;