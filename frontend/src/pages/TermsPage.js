import React from "react";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Conditions d’utilisation
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Conditions générales d’utilisation
          </h1>
          <p className="text-zinc-300 text-lg leading-8">
            Les présentes conditions générales d’utilisation ont pour objet de
            définir les modalités d’accès et d’utilisation du site et du jeu
            Ryvenox Empire, ainsi que les droits et obligations des
            utilisateurs.
          </p>
          <p className="text-zinc-300 leading-8">
            En accédant au site, en créant un compte ou en utilisant les
            fonctionnalités proposées, vous acceptez pleinement et sans réserve
            les présentes conditions. Si vous n’acceptez pas ces conditions,
            vous devez cesser d’utiliser le site et ses services.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Objet du service</h2>
          <p className="text-zinc-300 leading-8">
            Ryvenox Empire est un jeu en ligne de type idle / clicker dans
            lequel les utilisateurs développent une startup virtuelle, génèrent
            des utilisateurs, débloquent des améliorations, automatisent leur
            progression et peuvent comparer leurs performances via un
            classement.
          </p>
          <p className="text-zinc-300 leading-8">
            Le site peut également proposer des contenus d’information, des
            pages d’aide, des explications de gameplay, des classements, des
            actualités, des informations de compte utilisateur ainsi que, le
            cas échéant, des contenus publicitaires ou promotionnels.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Accès au site</h2>
          <p className="text-zinc-300 leading-8">
            L’accès au site est en principe possible à tout utilisateur
            disposant d’une connexion internet compatible. Certains services
            peuvent nécessiter la création d’un compte, l’authentification ou
            le respect de conditions techniques minimales.
          </p>
          <p className="text-zinc-300 leading-8">
            L’éditeur s’efforce d’assurer une accessibilité raisonnable au site,
            mais ne saurait garantir une disponibilité permanente, continue et
            sans erreur. L’accès au service peut être suspendu, limité ou
            interrompu à tout moment, notamment pour maintenance, mise à jour,
            correction technique ou amélioration des fonctionnalités.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Création de compte</h2>
          <p className="text-zinc-300 leading-8">
            Certaines fonctionnalités du site nécessitent la création d’un
            compte personnel. L’utilisateur s’engage à fournir des informations
            exactes, à jour et complètes lors de son inscription.
          </p>
          <p className="text-zinc-300 leading-8">
            L’utilisateur est seul responsable de la confidentialité de ses
            identifiants de connexion et de l’usage de son compte. Toute
            activité réalisée depuis son compte est réputée avoir été effectuée
            par lui, sauf preuve contraire résultant d’un dysfonctionnement
            imputable au service.
          </p>
          <p className="text-zinc-300 leading-8">
            En cas d’accès non autorisé, de suspicion de compromission ou de
            perte des identifiants, l’utilisateur doit prendre immédiatement
            les mesures appropriées, notamment en modifiant son mot de passe et
            en contactant l’éditeur si nécessaire.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Règles d’utilisation</h2>
          <p className="text-zinc-300 leading-8">
            L’utilisateur s’engage à utiliser le site de manière loyale,
            conforme à sa destination et dans le respect des lois et
            réglementations applicables.
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-3 leading-8">
            <li>ne pas perturber le bon fonctionnement du service ;</li>
            <li>
              ne pas tenter d’accéder frauduleusement aux systèmes, données ou
              comptes d’autres utilisateurs ;
            </li>
            <li>
              ne pas utiliser de scripts, bots, exploits, programmes
              automatisés ou moyens détournés pour fausser la progression ou le
              classement ;
            </li>
            <li>
              ne pas contourner les mécanismes de sécurité, de limitation ou de
              protection ;
            </li>
            <li>
              ne pas publier, transmettre ou diffuser de contenu illicite,
              injurieux, frauduleux ou nuisible ;
            </li>
            <li>
              ne pas porter atteinte aux droits de propriété intellectuelle de
              l’éditeur ou de tiers.
            </li>
          </ul>
          <p className="text-zinc-300 leading-8">
            Toute utilisation abusive, frauduleuse ou contraire à l’esprit du
            jeu pourra entraîner des mesures de modération, de restriction ou
            de suppression de compte, sans préjudice d’éventuelles actions
            complémentaires.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Gameplay, équilibre et classement</h2>
          <p className="text-zinc-300 leading-8">
            Ryvenox Empire repose sur des mécaniques de progression, de
            génération de ressources, d’upgrades, d’automatisation et de
            compétition. L’éditeur se réserve le droit de modifier à tout
            moment les paramètres du jeu, les valeurs, les équilibrages, les
            vitesses de progression, les récompenses ou les conditions
            d’apparition au classement.
          </p>
          <p className="text-zinc-300 leading-8">
            Les classements sont fournis à titre indicatif dans un objectif de
            compétition et d’animation communautaire. L’éditeur ne garantit pas
            l’absence totale d’erreur, de décalage d’affichage ou d’ajustement
            technique temporaire.
          </p>
          <p className="text-zinc-300 leading-8">
            En cas de triche, d’exploitation de faille, d’anomalie technique ou
            de comportement compromettant l’équité globale, l’éditeur peut
            corriger les données, ajuster la progression, retirer une position
            au classement ou suspendre un compte.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Propriété intellectuelle</h2>
          <p className="text-zinc-300 leading-8">
            L’ensemble des éléments présents sur le site, notamment les textes,
            interfaces, graphismes, logos, marques, éléments visuels, contenus,
            composants logiciels, mécaniques originales de présentation et plus
            généralement la structure du service, sont protégés par le droit de
            la propriété intellectuelle.
          </p>
          <p className="text-zinc-300 leading-8">
            Sauf autorisation écrite préalable, toute reproduction,
            représentation, adaptation, extraction, modification, diffusion ou
            exploitation, totale ou partielle, de tout ou partie du site est
            interdite.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Données personnelles</h2>
          <p className="text-zinc-300 leading-8">
            Les modalités de collecte et de traitement des données personnelles
            sont décrites dans la Politique de confidentialité du site.
            L’utilisateur est invité à la consulter afin de comprendre quelles
            données sont traitées, dans quels buts et selon quelles bases
            légales ou modalités pratiques.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Publicité et services tiers</h2>
          <p className="text-zinc-300 leading-8">
            Le site peut afficher des contenus publicitaires, notamment via des
            partenaires tiers. L’affichage, le ciblage, la mesure d’audience ou
            la personnalisation éventuelle de ces publicités peuvent impliquer
            l’utilisation de technologies telles que les cookies ou autres
            traceurs, selon les paramètres de consentement applicables.
          </p>
          <p className="text-zinc-300 leading-8">
            Le site peut également contenir des liens vers des services ou sites
            tiers. L’éditeur n’exerce pas de contrôle sur ces services externes
            et ne saurait être responsable de leur contenu, de leur sécurité ou
            de leurs propres politiques.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Responsabilité</h2>
          <p className="text-zinc-300 leading-8">
            L’éditeur met en œuvre des efforts raisonnables pour offrir un
            service fiable et sécurisé. Toutefois, il ne peut garantir que le
            site sera exempt de bugs, d’erreurs, d’interruptions, de pertes de
            données, d’incompatibilités techniques ou d’incidents temporaires.
          </p>
          <p className="text-zinc-300 leading-8">
            L’utilisateur reconnaît utiliser le service sous sa propre
            responsabilité. L’éditeur ne pourra être tenu responsable des
            dommages indirects, pertes d’opportunité, pertes de données, pertes
            d’exploitation ou préjudices résultant de l’utilisation ou de
            l’impossibilité d’utiliser le site, sauf disposition impérative
            contraire.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Suspension ou suppression de compte</h2>
          <p className="text-zinc-300 leading-8">
            L’éditeur se réserve le droit de suspendre, restreindre ou supprimer
            l’accès à tout ou partie du service en cas de non-respect des
            présentes conditions, de tentative de fraude, de comportement
            portant atteinte au bon fonctionnement du site ou d’obligation
            légale.
          </p>
          <p className="text-zinc-300 leading-8">
            Selon la gravité de la situation, ces mesures peuvent être prises
            sans préavis lorsque cela est nécessaire à la sécurité, à
            l’intégrité du service ou à la protection des autres utilisateurs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Modification des conditions</h2>
          <p className="text-zinc-300 leading-8">
            Les présentes conditions peuvent être modifiées à tout moment afin
            de tenir compte des évolutions du service, des exigences légales,
            des changements techniques ou de nouvelles fonctionnalités.
          </p>
          <p className="text-zinc-300 leading-8">
            La version applicable est celle publiée sur le site au moment de la
            consultation. Il appartient à l’utilisateur de les consulter
            régulièrement.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. Droit applicable</h2>
          <p className="text-zinc-300 leading-8">
            Les présentes conditions sont régies par le droit applicable au lieu
            d’établissement de l’éditeur, sous réserve des dispositions
            impératives éventuellement applicables à l’utilisateur en tant que
            consommateur.
          </p>
          <p className="text-zinc-300 leading-8">
            En cas de litige, une solution amiable sera recherchée en priorité
            avant toute procédure contentieuse, lorsque cela est possible.
          </p>
        </section>

        <footer className="pt-6 border-t border-zinc-800">
          <p className="text-zinc-400 leading-7">
            Dernière mise à jour : à compléter selon la date de mise en ligne
            effective.
          </p>
        </footer>
      </div>
    </div>
  );
}