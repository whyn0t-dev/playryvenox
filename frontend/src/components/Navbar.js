import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Zap,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Languages,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar({ soundEnabled, toggleSound }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language?.startsWith("fr") ? "fr" : "en";

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const toggleLanguage = async () => {
    const newLanguage = currentLanguage === "fr" ? "en" : "fr";
    await i18n.changeLanguage(newLanguage);
    localStorage.setItem("i18nextLng", newLanguage);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
        px-4 py-2 font-medium transition-colors duration-200
        ${isActive(path) 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"}
    `;

  return (
    <nav className="navbar sticky top-0 z-50" data-testid="navbar">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <div className="w-8 h-8 bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              Ryvenox Empire
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && (
              <>
                <Link to="/game" className={navLinkClass("/game")} data-testid="nav-game">
                  {t("navbar.play")}
                </Link>
                <Link
                  to="/leaderboard"
                  className={navLinkClass("/leaderboard")}
                  data-testid="nav-leaderboard"
                >
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {t("navbar.leaderboard")}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className={navLinkClass("/profile")}
                  data-testid="nav-profile"
                >
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {t("navbar.profile")}
                  </span>
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/leaderboard"
                className={navLinkClass("/leaderboard")}
                data-testid="nav-leaderboard"
              >
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  {t("navbar.leaderboard")}
                </span>
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="rounded-sm"
              data-testid="nav-sound-btn"
              aria-label={soundEnabled ? "Couper le son" : "Activer le son"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="rounded-sm"
              data-testid="nav-language-btn"
              aria-label={currentLanguage === "fr" ? "Passer en anglais" : "Switch to French"}
            >
              <Languages className="w-4 h-4 mr-1" />
              {currentLanguage === "fr" ? "EN" : "FR"}
            </Button>

            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground mr-2">
                  {user?.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-sm"
                  data-testid="nav-logout-btn"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t("navbar.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-sm"
                    data-testid="nav-login-btn"
                  >
                    {t("navbar.login")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm"
                    data-testid="nav-register-btn"
                  >
                    {t("navbar.signup")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
            aria-label={t("navbar.menu")}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border" data-testid="mobile-menu">
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                data-testid="mobile-language-btn"
              >
                <span className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {currentLanguage === "fr" ? "Switch to English" : "Passer en français"}
                </span>
              </button>

              <button
                onClick={toggleSound}
                className="px-4 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                data-testid="mobile-sound-btn"
              >
                <span className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  {soundEnabled ? "Couper le son" : "Activer le son"}
                </span>
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/game"
                    className={navLinkClass("/game")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.play")}
                  </Link>
                  <Link
                    to="/leaderboard"
                    className={navLinkClass("/leaderboard")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.leaderboard")}
                  </Link>
                  <Link
                    to="/profile"
                    className={navLinkClass("/profile")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.profile")}
                  </Link>
                  <Link
                    to="/about"
                    className={navLinkClass("/about")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.about")}
                  </Link>
                  <Link
                    to="/faq"
                    className={navLinkClass("/faq")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.faq")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-left text-destructive hover:bg-destructive/10"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      {t("navbar.logout")}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/leaderboard"
                    className={navLinkClass("/leaderboard")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.leaderboard")}
                  </Link>
                  <Link
                    to="/login"
                    className={navLinkClass("/login")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.login")}
                  </Link>
                  <Link
                    to="/register"
                    className={navLinkClass("/register")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.signup")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}