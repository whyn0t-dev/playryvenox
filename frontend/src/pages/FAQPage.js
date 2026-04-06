import React from "react";
import { useTranslation } from "react-i18next";

export default function FAQPage() {
  const { t } = useTranslation();

  const faqs = [
    {
      q: t("faq.items.0.q"),
      a: t("faq.items.0.a"),
    },
    {
      q: t("faq.items.1.q"),
      a: t("faq.items.1.a"),
    },
    {
      q: t("faq.items.2.q"),
      a: t("faq.items.2.a"),
    },
    {
      q: t("faq.items.3.q"),
      a: t("faq.items.3.a"),
    },
    {
      q: t("faq.items.4.q"),
      a: t("faq.items.4.a"),
    },
    {
      q: t("faq.items.5.q"),
      a: t("faq.items.5.a"),
    },
    {
      q: t("faq.items.6.q"),
      a: t("faq.items.6.a"),
    },
    {
      q: t("faq.items.7.q"),
      a: t("faq.items.7.a"),
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            {t("faq.badge")}
          </p>

          <h1 className="text-4xl md:text-6xl font-bold">
            {t("faq.title")}
          </h1>

          <p className="text-lg text-gray-300 leading-8 max-w-3xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </header>

        <section className="space-y-6">
          {faqs.map((item, index) => (
            <article
              key={index}
              className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
            >
              <h2 className="text-2xl font-semibold mb-4">{item.q}</h2>
              <p className="text-gray-300 leading-8">{item.a}</p>
            </article>
          ))}
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-5">
          <h2 className="text-3xl font-semibold">
            {t("faq.tips.title")}
          </h2>

          <p className="text-gray-300 leading-8">
            {t("faq.tips.paragraph1")}
          </p>

          <p className="text-gray-300 leading-8">
            {t("faq.tips.paragraph2")}
          </p>
        </section>
      </div>
    </main>
  );
}