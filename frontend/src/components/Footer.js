import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border mt-10 py-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">

        {/* Brand */}
        <div>
          <h3 className="font-bold text-base mb-2">Ryvenox</h3>
          <p className="text-muted-foreground text-xs">
            {t("footer.description")}
          </p>
        </div>

        {/* Game */}
        <div>
          <h4 className="font-semibold mb-2">{t("footer.game.title")}</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/game" className="hover:text-primary">{t("footer.game.play")}</Link></li>
            <li><Link to="/leaderboard" className="hover:text-primary">{t("footer.game.leaderboard")}</Link></li>
            <li><Link to="/how-to-play" className="hover:text-primary">{t("footer.game.howto")}</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-semibold mb-2">{t("footer.account.title")}</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/profile" className="hover:text-primary">{t("footer.account.profile")}</Link></li>
            <li><Link to="/login" className="hover:text-primary">{t("footer.account.login")}</Link></li>
            <li><Link to="/register" className="hover:text-primary">{t("footer.account.register")}</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold mb-2">{t("footer.legal.title")}</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/terms" className="hover:text-primary">{t("footer.legal.terms")}</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary">{t("footer.legal.privacy")}</Link></li>
            <li><Link to="/legal-notice" className="hover:text-primary">{t("footer.legal.notice")}</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}