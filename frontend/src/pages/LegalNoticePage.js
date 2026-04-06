import React from "react";
import { useTranslation } from "react-i18next";

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Informations légales
          </p>
          <h1 className="text-4xl md:text-6xl font-bold">Mentions légales</h1>
          <p className="text-lg text-zinc-300 leading-8">
            Les présentes mentions légales ont pour objet d’informer les utilisateurs
            du site sur l’identité de l’éditeur, de l’hébergeur, sur les conditions
            d’accès au site ainsi que sur les responsabilités applicables à son
            utilisation.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Éditeur du site</h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
            <p className="text-zinc-300 leading-8">
              <strong>Nom du site :</strong> Ryvenox Empire / Play Ryvenox
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Nom ou raison sociale :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Statut juridique :</strong> [Entreprise individuelle / Micro-entreprise / SASU / SAS / EURL / Autre]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Nom du responsable de la publication :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Adresse e-mail de contact :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Adresse postale :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Numéro de téléphone :</strong> [Optionnel – à compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>SIREN / SIRET :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Numéro de TVA intracommunautaire :</strong> [À compléter si applicable]
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Hébergement</h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
            <p className="text-zinc-300 leading-8">
              <strong>Hébergeur :</strong> [Nom de l’hébergeur]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Raison sociale :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Adresse :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Site web :</strong> [À compléter]
            </p>
            <p className="text-zinc-300 leading-8">
              <strong>Téléphone :</strong> [Optionnel]
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Directeur de la publication</h2>
          <p className="text-zinc-300 leading-8">
            Le directeur de la publication du site est : <strong>[Nom / Prénom à compléter]</strong>.
          </p>
          <p className="text-zinc-300 leading-8">
            Le cas échéant, le co-directeur de la publication est :
            <strong> [À compléter si nécessaire]</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Conception et développement</h2>
          <p className="text-zinc-300 leading-8">
            Le site Ryvenox Empire / Play Ryvenox a été conçu et développé par :
            <strong> [À compléter]</strong>.
          </p>
          <p className="text-zinc-300 leading-8">
            Technologies utilisées : application web front-end, services d’authentification,
            services backend et outils de mesure d’audience ou de performance lorsque cela
            est nécessaire au fonctionnement et à l’amélioration du service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Objet du site</h2>
          <p className="text-zinc-300 leading-8">
            Le présent site a pour objet de proposer un jeu en ligne de type idle / clicker
            permettant aux utilisateurs de développer une startup virtuelle, d’améliorer
            leur progression, de consulter un classement et d’accéder à des fonctionnalités
            liées à leur compte utilisateur.
          </p>
          <p className="text-zinc-300 leading-8">
            Le site peut également proposer des contenus informatifs, des pages d’aide, des
            pages de présentation, des classements, des actualités, ainsi que des contenus
            promotionnels ou publicitaires selon les cas.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Accès au site</h2>
          <p className="text-zinc-300 leading-8">
            Le site est accessible en principe 24 heures sur 24 et 7 jours sur 7, sauf
            interruption programmée ou non, notamment pour les besoins de maintenance,
            de mise à jour, d’amélioration technique ou en cas de force majeure.
          </p>
          <p className="text-zinc-300 leading-8">
            L’éditeur ne saurait être tenu responsable de toute indisponibilité, suspension
            ou interruption du site, quelle qu’en soit la cause.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Propriété intellectuelle</h2>
          <p className="text-zinc-300 leading-8">
            L’ensemble des éléments présents sur le site, notamment les textes, graphismes,
            logos, icônes, interfaces, éléments visuels, illustrations, bases de données,
            fonctionnalités, code source, structure générale et contenus, sont protégés par
            les dispositions du Code de la propriété intellectuelle et appartiennent à
            l’éditeur du site ou font l’objet d’un droit d’utilisation.
          </p>
          <p className="text-zinc-300 leading-8">
            Toute reproduction, représentation, diffusion, adaptation, traduction,
            modification, extraction ou exploitation, totale ou partielle, de l’un quelconque
            de ces éléments, par quelque procédé que ce soit, sans autorisation écrite
            préalable de l’éditeur, est strictement interdite, sauf exceptions prévues par
            la loi.
          </p>
          <p className="text-zinc-300 leading-8">
            Toute utilisation non autorisée du site ou de l’un quelconque des éléments qu’il
            contient pourra donner lieu à des poursuites.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Données personnelles</h2>
          <p className="text-zinc-300 leading-8">
            Le site peut collecter et traiter certaines données personnelles dans le cadre
            de la création de compte, de l’authentification, de la gestion de la progression
            de jeu, de la relation utilisateur, de la sécurité de la plateforme, des mesures
            d’audience et de l’affichage éventuel de contenus publicitaires.
          </p>
          <p className="text-zinc-300 leading-8">
            Les modalités détaillées de collecte, de traitement, de conservation et
            d’exercice des droits des utilisateurs sont précisées dans la Politique de
            confidentialité du site.
          </p>
          <p className="text-zinc-300 leading-8">
            Conformément à la réglementation applicable, l’utilisateur dispose notamment
            d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition
            et, le cas échéant, de portabilité de ses données.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Cookies et traceurs</h2>
          <p className="text-zinc-300 leading-8">
            Le site peut utiliser des cookies et autres traceurs pour assurer son bon
            fonctionnement, mesurer son audience, améliorer l’expérience utilisateur et,
            le cas échéant, proposer des contenus ou publicités personnalisés.
          </p>
          <p className="text-zinc-300 leading-8">
            Lorsqu’une réglementation applicable l’exige, le consentement de l’utilisateur
            est recueilli avant le dépôt des traceurs non strictement nécessaires.
          </p>
          <p className="text-zinc-300 leading-8">
            Pour en savoir plus, l’utilisateur est invité à consulter la Politique de
            confidentialité ou la politique de gestion des cookies du site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Publicité et services tiers</h2>
          <p className="text-zinc-300 leading-8">
            Le site peut afficher des contenus publicitaires, sponsorisés ou promotionnels,
            notamment via des plateformes publicitaires tierces telles que Google AdSense,
            sous réserve de leur mise en place effective.
          </p>
          <p className="text-zinc-300 leading-8">
            Ces services tiers peuvent utiliser des cookies, identifiants ou technologies
            similaires pour mesurer les performances, limiter la répétition des annonces
            ou personnaliser les publicités affichées, conformément à leurs propres politiques
            de confidentialité et aux choix exprimés par l’utilisateur.
          </p>
          <p className="text-zinc-300 leading-8">
            L’éditeur invite les utilisateurs à consulter les informations relatives aux
            traitements de données réalisés par ces partenaires via la Politique de
            confidentialité du site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Responsabilité</h2>
          <p className="text-zinc-300 leading-8">
            L’éditeur met en œuvre les moyens raisonnables pour fournir des informations
            exactes et un service accessible, mais ne garantit pas l’exactitude, l’exhaustivité
            ou l’actualité permanente des contenus publiés sur le site.
          </p>
          <p className="text-zinc-300 leading-8">
            L’utilisateur reconnaît utiliser le site sous sa responsabilité exclusive.
            L’éditeur ne pourra être tenu responsable des dommages directs ou indirects,
            matériels ou immatériels, résultant de l’utilisation du site, d’une interruption
            de service, d’un bug, d’une incompatibilité technique ou d’un accès non autorisé.
          </p>
          <p className="text-zinc-300 leading-8">
            L’éditeur ne peut davantage être tenu responsable des contenus accessibles via
            d’éventuels liens externes présents sur le site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. Compte utilisateur</h2>
          <p className="text-zinc-300 leading-8">
            Certaines fonctionnalités du site peuvent nécessiter la création d’un compte
            utilisateur. L’utilisateur s’engage à fournir des informations exactes, à ne pas
            usurper l’identité d’un tiers et à préserver la confidentialité de ses identifiants.
          </p>
          <p className="text-zinc-300 leading-8">
            L’utilisateur demeure responsable de toute activité réalisée depuis son compte,
            sauf preuve d’un usage frauduleux non imputable à sa faute.
          </p>
          <p className="text-zinc-300 leading-8">
            L’éditeur se réserve le droit de suspendre ou supprimer un compte en cas de
            non-respect des règles applicables, d’abus, de fraude, de tentative de triche,
            d’atteinte au bon fonctionnement du service ou de comportement contraire aux
            présentes mentions et aux conditions d’utilisation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">13. Sécurité</h2>
          <p className="text-zinc-300 leading-8">
            L’éditeur s’efforce de mettre en place des mesures techniques et organisationnelles
            appropriées pour protéger le site et les données traitées contre l’altération,
            la destruction, la perte, la divulgation ou l’accès non autorisé.
          </p>
          <p className="text-zinc-300 leading-8">
            Toutefois, aucun système n’étant totalement invulnérable, l’éditeur ne peut
            garantir une sécurité absolue.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">14. Droit applicable</h2>
          <p className="text-zinc-300 leading-8">
            Les présentes mentions légales sont régies par le droit français.
          </p>
          <p className="text-zinc-300 leading-8">
            En cas de litige et à défaut de résolution amiable, les juridictions françaises
            seront seules compétentes, sauf disposition légale impérative contraire.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">15. Contact</h2>
          <p className="text-zinc-300 leading-8">
            Pour toute question concernant le site, son fonctionnement, vos données
            personnelles ou les présentes mentions légales, vous pouvez contacter l’éditeur
            à l’adresse suivante : <strong>[adresse e-mail à compléter]</strong>.
          </p>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-amber-300">
            Informations à remplacer avant mise en ligne
          </h2>
          <ul className="list-disc pl-6 text-zinc-200 space-y-2 leading-7">
            <li>Nom ou raison sociale</li>
            <li>Forme juridique</li>
            <li>Nom du responsable de la publication</li>
            <li>Adresse postale</li>
            <li>Adresse e-mail</li>
            <li>SIREN / SIRET</li>
            <li>Numéro de TVA si applicable</li>
            <li>Nom et coordonnées complètes de l’hébergeur</li>
          </ul>
        </section>
      </div>
    </div>
  );
}