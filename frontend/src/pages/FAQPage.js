import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

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
    <>
      <Helmet>
        <title>FAQ – Ryvenox</title>
        <meta name="description" content="Frequently asked questions about Ryvenox. Find answers about gameplay, rules, scoring, and how to get started." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://playryvenox.com/faq" />
        <meta property="og:title" content="FAQ – Ryvenox" />
        <meta property="og:description" content="Frequently asked questions about Ryvenox. Find answers about gameplay, rules, scoring, and how to get started." />
        <meta property="og:url" content="https://playryvenox.com/faq" />
        <meta property="og:type" content="website" />
      </Helmet>

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
    </>
  );
}