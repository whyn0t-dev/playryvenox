import React from "react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            À propos
          </p>
          <h1 className="text-4xl md:text-6xl font-bold">
            À propos de AI Startup Clicker
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-8">
            AI Startup Clicker est un jeu idle / clicker compétitif où vous
            partez de zéro pour bâtir une startup IA capable de conquérir des
            milliers, puis des millions d’utilisateurs. Chaque clic représente
            une décision, chaque amélioration accélère votre progression, et
            chaque joueur poursuit le même objectif : dominer le classement.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-4">Notre vision</h2>
            <p className="text-gray-300 leading-8 mb-4">
              Nous avons conçu AI Startup Clicker pour offrir une expérience
              simple à comprendre, mais difficile à maîtriser. Le jeu repose sur
              une idée forte : transformer l’évolution d’une startup en boucle
              de progression ludique, satisfaisante et compétitive.
            </p>
            <p className="text-gray-300 leading-8">
              L’objectif n’est pas seulement de cliquer rapidement. Il s’agit de
              choisir les bons upgrades, de débloquer les meilleures synergies,
              de miser sur l’automatisation au bon moment et de dépasser les
              autres fondateurs dans une véritable course à la croissance.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-4">Ce qui rend le jeu unique</h2>
            <p className="text-gray-300 leading-8 mb-4">
              AI Startup Clicker mélange plusieurs sensations de jeu dans une
              seule expérience :
            </p>
            <ul className="space-y-3 text-gray-300 leading-8 list-disc pl-5">
              <li>la satisfaction immédiate du clicker,</li>
              <li>la progression continue propre aux jeux idle,</li>
              <li>la réflexion stratégique des systèmes d’upgrade,</li>
              <li>la pression de la compétition grâce au leaderboard global.</li>
            </ul>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-6">
          <h2 className="text-3xl font-semibold">Le concept du jeu</h2>
          <p className="text-gray-300 leading-8">
            Vous commencez comme un fondateur inconnu avec une idée ambitieuse
            mais peu de ressources. Votre mission consiste à attirer vos
            premiers utilisateurs, à renforcer votre pouvoir de clic, à générer
            des revenus ou des gains passifs, puis à transformer une petite
            structure en véritable empire technologique.
          </p>
          <p className="text-gray-300 leading-8">
            Au fil de votre progression, vous devrez arbitrer entre puissance
            immédiate et croissance long terme. Faut-il investir tout de suite
            dans un boost de clic pour accélérer votre montée en régime ? Ou
            vaut-il mieux miser sur l’automatisation pour continuer à progresser
            même lorsque vous n’êtes pas connecté ? C’est ce genre de choix qui
            rend chaque partie engageante.
          </p>
          <p className="text-gray-300 leading-8">
            Le classement ajoute une couche essentielle à cette expérience.
            Chaque joueur ne progresse pas seul dans son coin : il participe à
            une compétition où le moindre gain compte. Voir un autre fondateur
            prendre de l’avance pousse à revenir, optimiser, et tenter de
            reprendre sa place.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold mb-3">Commencer vite</h3>
            <p className="text-gray-300 leading-7">
              Le jeu est pensé pour être immédiatement compréhensible. Vous
              pouvez commencer en quelques secondes et ressentir très vite les
              premiers effets de votre progression.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold mb-3">Optimiser intelligemment</h3>
            <p className="text-gray-300 leading-7">
              Derrière sa simplicité apparente, AI Startup Clicker récompense
              les joueurs qui savent anticiper, comparer, investir au bon moment
              et tirer parti des mécaniques d’automatisation.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold mb-3">Revenir chaque jour</h3>
            <p className="text-gray-300 leading-7">
              Entre les gains passifs, la compétition et la progression
              constante, le jeu encourage naturellement les sessions courtes mais
              régulières.
            </p>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-6">
          <h2 className="text-3xl font-semibold">Pourquoi un univers startup IA ?</h2>
          <p className="text-gray-300 leading-8">
            L’univers de la startup IA permet de transposer des mécaniques de
            croissance, de scalabilité et d’optimisation dans une forme simple,
            lisible et addictive. Le joueur comprend intuitivement la logique :
            acquérir des utilisateurs, lancer des campagnes, améliorer ses
            performances, automatiser ses process, puis accélérer encore.
          </p>
          <p className="text-gray-300 leading-8">
            Cet habillage donne une identité forte au jeu. Vous ne cliquez pas
            simplement sur un compteur abstrait : vous développez une entreprise
            numérique, vous faites grandir une base d’utilisateurs, vous cherchez
            à battre les autres fondateurs, et vous construisez quelque chose de
            plus en plus imposant.
          </p>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-5">
          <h2 className="text-3xl font-semibold">Notre ambition</h2>
          <p className="text-gray-300 leading-8">
            Notre ambition est de faire évoluer AI Startup Clicker dans la durée
            avec de nouvelles mécaniques, davantage d’upgrades, plus de profondeur
            stratégique, des équilibrages réguliers et un environnement
            compétitif toujours plus intéressant.
          </p>
          <p className="text-gray-300 leading-8">
            Nous voulons proposer un jeu web accessible, fluide et capable de
            donner envie de revenir jour après jour, autant pour le plaisir de
            progresser que pour la satisfaction d’apparaître parmi les meilleurs
            joueurs du classement.
          </p>
        </section>

        <section className="text-center pt-4">
          <h2 className="text-2xl font-semibold mb-4">
            Commencez votre ascension
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto leading-8">
            Chaque grand empire commence par une première action. Lancez votre
            startup, recrutez vos premiers utilisateurs, investissez
            intelligemment et voyez jusqu’où votre stratégie peut vous mener.
          </p>
        </section>
      </div>
    </main>
  );
}