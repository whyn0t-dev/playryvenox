import React from "react";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            {t("about.badge")}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold">
            {t("about.hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-8">
            {t("about.hero.description")}
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-4">
              {t("about.vision.title")}
            </h2>
            <p className="text-gray-300 leading-8 mb-4">
              {t("about.vision.p1")}
            </p>
            <p className="text-gray-300 leading-8">
              {t("about.vision.p2")}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-4">
              {t("about.unique.title")}
            </h2>
            <p className="text-gray-300 leading-8 mb-4">
              {t("about.unique.intro")}
            </p>
            <ul className="space-y-3 text-gray-300 leading-8 list-disc pl-5">
              <li>{t("about.unique.item1")}</li>
              <li>{t("about.unique.item2")}</li>
              <li>{t("about.unique.item3")}</li>
              <li>{t("about.unique.item4")}</li>
            </ul>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-6">
          <h2 className="text-3xl font-semibold">
            {t("about.concept.title")}
          </h2>
          <p className="text-gray-300 leading-8">
            {t("about.concept.p1")}
          </p>
          <p className="text-gray-300 leading-8">
            {t("about.concept.p2")}
          </p>
          <p className="text-gray-300 leading-8">
            {t("about.concept.p3")}
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold mb-3">
              {t("about.highlights.fast.title")}
            </h3>
            <p className="text-gray-300 leading-7">
              {t("about.highlights.fast.description")}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold mb-3">
              {t("about.highlights.optimize.title")}
            </h3>
            <p className="text-gray-300 leading-7">
              {t("about.highlights.optimize.description")}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold mb-3">
              {t("about.highlights.daily.title")}
            </h3>
            <p className="text-gray-300 leading-7">
              {t("about.highlights.daily.description")}
            </p>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-6">
          <h2 className="text-3xl font-semibold">
            {t("about.theme.title")}
          </h2>
          <p className="text-gray-300 leading-8">
            {t("about.theme.p1")}
          </p>
          <p className="text-gray-300 leading-8">
            {t("about.theme.p2")}
          </p>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-5">
          <h2 className="text-3xl font-semibold">
            {t("about.ambition.title")}
          </h2>
          <p className="text-gray-300 leading-8">
            {t("about.ambition.p1")}
          </p>
          <p className="text-gray-300 leading-8">
            {t("about.ambition.p2")}
          </p>
        </section>

        <section className="text-center pt-4">
          <h2 className="text-2xl font-semibold mb-4">
            {t("about.cta.title")}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto leading-8">
            {t("about.cta.description")}
          </p>
        </section>
      </div>
    </main>
  );
}