import React from "react";
import { useTranslation } from "react-i18next";

export default function LegalNoticePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold">
            {t("eyebrow.title")}
          </h1>
          <p className="text-lg text-zinc-300 leading-8">
            {t("intro")}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.editor.title")}</h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.siteName")}</strong> {t("sections.editor.siteNameValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.companyName")}</strong> {t("sections.editor.companyNameValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.legalStatus")}</strong> {t("sections.editor.legalStatusValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.publisher")}</strong> {t("sections.editor.publisherValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.email")}</strong> {t("sections.editor.emailValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.address")}</strong> {t("sections.editor.addressValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.phone")}</strong> {t("sections.editor.phoneValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.siret")}</strong> {t("sections.editor.siretValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.editor.vat")}</strong> {t("sections.editor.vatValue")}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.hosting.title")}</h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.hosting.host")}</strong> {t("sections.hosting.hostValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.hosting.company")}</strong> {t("sections.hosting.companyValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.hosting.address")}</strong> {t("sections.hosting.addressValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.hosting.website")}</strong> {t("sections.hosting.websiteValue")}
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>{t("sections.hosting.phone")}</strong> {t("sections.hosting.phoneValue")}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {t("sections.publicationDirector.title")}
          </h2>
          <p className="text-zinc-300 leading-8">
            {t("sections.publicationDirector.paragraph1")}{" "}
            <strong>{t("sections.publicationDirector.paragraph1Strong")}</strong>.
          </p>
          <p className="text-zinc-300 leading-8">
            {t("sections.publicationDirector.paragraph2")}{" "}
            <strong>{t("sections.publicationDirector.paragraph2Strong")}</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.development.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("sections.development.paragraph1")}{" "}
            <strong>{t("sections.development.paragraph1Strong")}</strong>.
          </p>
          <p className="text-zinc-300 leading-8">
            {t("sections.development.paragraph2")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.purpose.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.purpose.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.purpose.paragraph2")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.access.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.access.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.access.paragraph2")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {t("sections.intellectualProperty.title")}
          </h2>
          <p className="text-zinc-300 leading-8">
            {t("sections.intellectualProperty.paragraph1")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("sections.intellectualProperty.paragraph2")}
          </p>
          <p className="text-zinc-300 leading-8">
            {t("sections.intellectualProperty.paragraph3")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.personalData.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.personalData.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.personalData.paragraph2")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.personalData.paragraph3")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.cookies.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.cookies.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.cookies.paragraph2")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.cookies.paragraph3")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.ads.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.ads.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.ads.paragraph2")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.ads.paragraph3")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.liability.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.liability.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.liability.paragraph2")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.liability.paragraph3")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.account.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.account.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.account.paragraph2")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.account.paragraph3")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.security.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.security.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.security.paragraph2")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.applicableLaw.title")}</h2>
          <p className="text-zinc-300 leading-8">{t("sections.applicableLaw.paragraph1")}</p>
          <p className="text-zinc-300 leading-8">{t("sections.applicableLaw.paragraph2")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("sections.contact.title")}</h2>
          <p className="text-zinc-300 leading-8">
            {t("sections.contact.paragraph1")}{" "}
            <strong>{t("sections.contact.paragraph1Strong")}</strong>.
          </p>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-amber-300">
            {t("warning.title")}
          </h2>
          <ul className="list-disc pl-6 text-zinc-200 space-y-2 leading-7">
            {t("warning.items", { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}