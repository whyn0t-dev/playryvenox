import React from "react";
import { useTranslation } from "react-i18next";

export default function FAQPage() { 
  const { t } = useTranslation();
  const faqs = [
    {
      q: "Qu’est-ce que Ryvenox Empire ?",
      a: "Ryvenox Empire est un jeu idle / clicker compétitif dans lequel vous développez une startup IA. Vous cliquez pour acquérir des utilisateurs, débloquez des améliorations, automatisez votre progression et tentez de grimper dans le classement mondial.",
    },
    {
      q: "Le jeu est-il gratuit ?",
      a: "Le jeu peut être proposé gratuitement avec un accès direct via le navigateur. Certaines fonctionnalités peuvent évoluer dans le temps selon le développement du projet.",
    },
    {
      q: "Dois-je créer un compte pour jouer ?",
      a: "Certaines fonctionnalités, comme la sauvegarde de progression, l’accès au profil ou la participation au leaderboard, peuvent nécessiter la création d’un compte.",
    },
    {
      q: "Comment gagner plus vite ?",
      a: "La meilleure approche consiste à équilibrer puissance de clic, automatisation et retour régulier dans le jeu. Une bonne stratégie d’upgrades est souvent plus importante que la vitesse de clic seule.",
    },
    {
      q: "À quoi sert le leaderboard ?",
      a: "Le leaderboard permet de comparer votre progression à celle des autres joueurs. Il ajoute une dimension compétitive et encourage à optimiser votre stratégie.",
    },
    {
      q: "Puis-je progresser hors ligne ou en étant absent ?",
      a: "Selon les mécaniques actives dans votre session, vous pouvez générer des utilisateurs passivement pendant votre absence grâce aux systèmes d’automatisation.",
    },
    {
      q: "Le jeu reçoit-il des mises à jour ?",
      a: "Le projet a vocation à évoluer avec de nouveaux équilibrages, améliorations, contenus, ajustements de gameplay et optimisations techniques.",
    },
    {
      q: "Comment contacter l’équipe du site ?",
      a: "Vous pouvez utiliser la page Contact pour toute question liée au support, aux partenariats, aux signalements techniques ou aux demandes générales.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">FAQ</p>
          <h1 className="text-4xl md:text-6xl font-bold">
            Questions fréquentes
          </h1>
          <p className="text-lg text-gray-300 leading-8 max-w-3xl mx-auto">
            Retrouvez ici les réponses aux questions les plus courantes sur le
            fonctionnement du jeu, la progression, les comptes utilisateurs et
            l’expérience générale sur Ryvenox Empire.
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
          <h2 className="text-3xl font-semibold">Bonnes pratiques pour progresser</h2>
          <p className="text-gray-300 leading-8">
            Beaucoup de joueurs pensent qu’il suffit de cliquer sans réfléchir.
            En réalité, la progression dépend aussi du bon timing de vos achats,
            de votre capacité à anticiper et de votre régularité.
          </p>
          <p className="text-gray-300 leading-8">
            Si vous débutez, essayez de construire un équilibre entre gains
            immédiats et rendement automatique. Cela vous donnera une base plus
            solide pour tenir sur la durée.
          </p>
        </section>
      </div>
    </main>
  );
}