import React from "react";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            {t("terms.eyebrow")}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {t("terms.title")}
          </h1>
          <p className="text-zinc-300 text-lg leading-8">
            {t("terms.intro.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.intro.paragraph2")}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.service.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.service.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.service.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.access.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.access.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.access.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.account.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.account.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.account.paragraph2")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.account.paragraph3")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.rules.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.rules.paragraph1")}
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-3 leading-8">
            {t("terms.sections.rules.items", { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.rules.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.gameplay.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.gameplay.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.gameplay.paragraph2")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.gameplay.paragraph3")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.intellectualProperty.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.intellectualProperty.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.intellectualProperty.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.personalData.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.personalData.paragraph1")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.ads.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.ads.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.ads.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.liability.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.liability.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.liability.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.suspension.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.suspension.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.suspension.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.modification.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.modification.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.modification.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("terms.sections.applicableLaw.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.applicableLaw.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("terms.sections.applicableLaw.paragraph2")}
          </p>
        </section>

        <footer className="pt-6 border-t border-zinc-800">
          <p className="text-zinc-400 leading-7">
            {t("terms.footer.lastUpdate")}
          </p>
        </footer>
      </div>
    </div>
  );
}