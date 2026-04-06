import React from "react";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            {t("privacy.eyebrow")}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {t("privacy.title")}
          </h1>
          <p className="text-zinc-300 text-lg leading-8">
            {t("privacy.intro.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("privacy.intro.paragraph2")}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.dataCollected.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.dataCollected.paragraph1")}
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-3 leading-8">
            {t("privacy.sections.dataCollected.items", { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.purposes.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.purposes.paragraph1")}
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-3 leading-8">
            {t("privacy.sections.purposes.items", { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.legalBasis.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.legalBasis.paragraph1")}
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-3 leading-8">
            {t("privacy.sections.legalBasis.items", { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.cookies.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.cookies.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.cookies.paragraph2")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.cookies.paragraph3")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.ads.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.ads.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.ads.paragraph2")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.ads.paragraph3")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.recipients.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.recipients.paragraph1")}
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-3 leading-8">
            {t("privacy.sections.recipients.items", { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.retention.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.retention.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.retention.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.security.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.security.paragraph1")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.rights.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.rights.paragraph1")}
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-3 leading-8">
            {t("privacy.sections.rights.items", { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.rights.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.minors.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.minors.paragraph1")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy.sections.changes.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("privacy.sections.changes.paragraph1")}
          </p>
        </section>

        <footer className="pt-6 border-t border-zinc-800">
          <p className="text-zinc-400 leading-7">
            {t("privacy.footer.lastUpdate")}
          </p>
        </footer>
      </div>
    </div>
  );
}