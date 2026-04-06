import React from "react";
import { useTranslation } from "react-i18next";

export default function HowToPlayPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Guide du jeu
          </p>
          <h1 className="text-4xl md:text-6xl font-bold">Comment jouer</h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-8">
            Découvrez les bases d’Ryvenox Empire, apprenez à faire croître
            votre startup, à débloquer l’automatisation, à optimiser vos choix
            et à grimper dans le leaderboard mondial.
          </p>
        </header>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <h2 className="text-3xl font-semibold mb-6">Le principe général</h2>
          <p className="text-gray-300 leading-8 mb-4">
            Ryvenox Empire est un jeu de progression où chaque action
            participe au développement de votre entreprise. Vous démarrez avec
            peu de ressources et devez générer vos premiers utilisateurs grâce à
            vos clics.
          </p>
          <p className="text-gray-300 leading-8">
            Au fur et à mesure, vous débloquez des améliorations qui renforcent
            votre efficacité, augmentent votre puissance de clic, puis mettent en
            place des systèmes automatiques capables de générer des utilisateurs
            même en votre absence.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="text-3xl font-bold mb-4">01</div>
            <h3 className="text-xl font-semibold mb-3">Cliquez pour démarrer</h3>
            <p className="text-gray-300 leading-7">
              Chaque clic vous rapporte des utilisateurs. Au début, votre
              croissance est entièrement manuelle, mais chaque action vous
              rapproche de vos premiers paliers.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="text-3xl font-bold mb-4">02</div>
            <h3 className="text-xl font-semibold mb-3">Achetez des upgrades</h3>
            <p className="text-gray-300 leading-7">
              Les améliorations vous permettent d’être plus efficace. Certaines
              augmentent le gain par clic, d’autres débloquent de la production
              passive ou renforcent la vitesse de croissance.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="text-3xl font-bold mb-4">03</div>
            <h3 className="text-xl font-semibold mb-3">Montez au classement</h3>
            <p className="text-gray-300 leading-7">
              Votre objectif final est de dépasser les autres joueurs. Plus vous
              optimisez votre progression, plus vous avez de chances de figurer
              parmi les meilleurs fondateurs.
            </p>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-6">
          <h2 className="text-3xl font-semibold">Les mécaniques essentielles</h2>

          <div>
            <h3 className="text-xl font-semibold mb-2">1. Les clics</h3>
            <p className="text-gray-300 leading-8">
              Les clics constituent votre moteur initial. Dans les premières
              minutes de jeu, ils représentent votre source principale de
              progression. Plus vous investissez dans votre puissance de clic,
              plus chaque action devient rentable.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">2. Les utilisateurs</h3>
            <p className="text-gray-300 leading-8">
              Les utilisateurs sont la ressource centrale du jeu. Ils mesurent
              la croissance de votre startup et servent à débloquer des
              améliorations, atteindre des paliers et avancer dans votre
              progression globale.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">3. Les upgrades</h3>
            <p className="text-gray-300 leading-8">
              Les upgrades améliorent vos performances. Certains offrent un gain
              immédiat, d’autres sont pensés pour le long terme. Savoir dans
              quel ordre les acheter est une partie importante de la stratégie.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">4. Le revenu passif</h3>
            <p className="text-gray-300 leading-8">
              Dès que vous débloquez l’automatisation, votre startup commence à
              travailler pour vous. Cela vous permet de continuer à générer des
              utilisateurs même lorsque vous ne cliquez plus activement.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">5. Le leaderboard</h3>
            <p className="text-gray-300 leading-8">
              Le classement mondial compare les performances des joueurs. Il ne
              suffit donc pas de progresser : il faut progresser mieux et plus
              vite que les autres.
            </p>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <h2 className="text-3xl font-semibold mb-6">Conseils pour bien débuter</h2>
          <ul className="space-y-4 list-disc pl-5 text-gray-300 leading-8">
            <li>
              Concentrez-vous d’abord sur une progression régulière plutôt que
              sur des achats trop coûteux.
            </li>
            <li>
              Investissez tôt dans les améliorations qui augmentent votre
              puissance de clic.
            </li>
            <li>
              Dès que possible, débloquez des sources de gains passifs pour ne
              pas dépendre uniquement de vos clics.
            </li>
            <li>
              Revenez régulièrement pour récupérer les bénéfices générés pendant
              votre absence.
            </li>
            <li>
              Surveillez le leaderboard pour mesurer votre rythme de croissance
              face aux autres joueurs.
            </li>
          </ul>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-4">Stratégie court terme</h2>
            <p className="text-gray-300 leading-8">
              Une stratégie court terme consiste à augmenter très vite votre
              rendement immédiat. Elle permet d’accélérer vos débuts, de franchir
              rapidement les premiers paliers et d’obtenir une sensation de
              progression constante.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-4">Stratégie long terme</h2>
            <p className="text-gray-300 leading-8">
              Une stratégie long terme privilégie les upgrades passifs et
              l’automatisation. Elle peut sembler plus lente au début, mais elle
              devient souvent plus rentable sur la durée, en particulier pour les
              joueurs réguliers.
            </p>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-5">
          <h2 className="text-3xl font-semibold">Pourquoi revenir souvent ?</h2>
          <p className="text-gray-300 leading-8">
            Dans un jeu idle, votre progression ne se limite pas au temps passé
            à cliquer. Les sessions courtes mais fréquentes sont très efficaces :
            elles permettent de récupérer les gains passifs, d’investir au bon
            moment et de maintenir une croissance stable.
          </p>
          <p className="text-gray-300 leading-8">
            Revenir régulièrement vous aide aussi à rester dans la course au
            classement. Dans un environnement compétitif, chaque période
            d’inactivité peut profiter à vos adversaires.
          </p>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Prêt à construire votre empire ?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto leading-8">
            Lancez votre startup, améliorez vos performances, automatisez votre
            croissance et voyez jusqu’où vous pouvez aller dans la compétition.
          </p>
        </section>
      </div>
    </main>
  );
}