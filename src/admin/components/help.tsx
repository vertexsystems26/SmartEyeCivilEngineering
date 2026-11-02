import type { ReactNode } from "react";

function Guide({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-6">
      <h2 id={id} className="text-h3">
        {title}
      </h2>
      <div className="rich-text flex flex-col gap-2">{children}</div>
    </section>
  );
}

/** Administrator guide (brief §7.7): the everyday tasks, step by step. */
export function Help() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="label-mono text-pine-700">Aide</p>
        <h1 className="text-h2">Guide de l&apos;administrateur</h1>
        <p className="measure text-pine-700">
          Tout ce qui est publié ici apparaît sur le site en quelques secondes, sans intervention technique.
        </p>
      </header>

      <nav aria-label="Sommaire de l'aide" className="flex flex-wrap gap-2 text-small">
        {[
          ["projet", "Ajouter un projet"],
          ["article", "Publier un article"],
          ["medias", "Images et textes alternatifs"],
          ["modele-3d", "Préparer un modèle 3D"],
          ["traduction", "Traduire en anglais"],
          ["acces", "Donner un accès"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="link rounded-full border border-line bg-paper px-3 py-1.5 no-underline"
          >
            {label}
          </a>
        ))}
      </nav>

      <Guide id="projet" title="Ajouter un projet avec photos">
        <ol>
          <li>
            Menu <strong>Projets</strong> → <strong>+ Nouveau projet</strong>.
          </li>
          <li>
            Onglet <strong>Général</strong> : titre, résumé (160 caractères) et{" "}
            <strong>contexte d&apos;intervention</strong>. Un projet mené avant décembre 2020 porte toujours «
            Expérience de notre ingénieur conseil ».
          </li>
          <li>
            Onglet <strong>Technique</strong> : lieu, période, surface, niveaux, services concernés.
          </li>
          <li>
            Onglet <strong>Médias</strong> : glissez-déposez vos photos dans la zone de la galerie, puis choisissez
            l&apos;image de couverture. Cliquez sur l&apos;aperçu de la couverture pour placer son point focal.
          </li>
          <li>
            Cliquez sur <strong>Publier</strong>. Tant que vous n&apos;avez pas publié, le projet reste un brouillon
            invisible sur le site.
          </li>
        </ol>
        <p>
          Vos saisies sont sauvegardées sur votre ordinateur pendant que vous travaillez : en cas de fermeture
          accidentelle, elles vous sont proposées à la réouverture.
        </p>
      </Guide>

      <Guide id="article" title="Publier un article">
        <ol>
          <li>
            Menu <strong>Actualités</strong> : six brouillons d&apos;articles techniques sont prêts, à rédiger.
          </li>
          <li>
            Structurez le texte avec <strong>T2</strong> et <strong>T3</strong> : ces intertitres forment le sommaire de
            l&apos;article.
          </li>
          <li>
            Renseignez le chapô, la catégorie, la date et une image de couverture, puis <strong>Publier</strong>.
          </li>
        </ol>
      </Guide>

      <Guide id="medias" title="Images et textes alternatifs">
        <p>
          Dans la <strong>Médiathèque</strong>, chaque image doit avoir un texte alternatif qui décrit ce qu&apos;elle
          montre. Le tableau de bord signale les images qui n&apos;en ont pas. Les tailles adaptées aux écrans (AVIF,
          WebP) sont générées automatiquement : envoyez simplement l&apos;original, de préférence en 2 000 px de large
          au maximum.
        </p>
        <p>
          Un fichier utilisé dans un contenu ne peut pas être supprimé : le bouton « Où est-il utilisé ? » indique où il
          apparaît.
        </p>
      </Guide>

      <Guide id="modele-3d" title="Préparer un modèle 3D">
        <ol>
          <li>
            Depuis Revit, ETABS, Robot ou AutoCAD, exportez la maquette en <strong>IFC</strong>, <strong>FBX</strong> ou{" "}
            <strong>OBJ</strong>.
          </li>
          <li>
            Ouvrez-la dans <strong>Blender</strong> (gratuit) : supprimez les éléments inutiles (annotations, objets
            cachés), appliquez des matériaux simples.
          </li>
          <li>
            Exportez au format <strong>glTF binaire (.glb)</strong>.
          </li>
          <li>
            Optimisez le fichier :{" "}
            <code>
              npx @gltf-transform/cli optimize modele.glb modele-optimise.glb --compress draco --texture-compress webp
            </code>
          </li>
          <li>
            Envoyez le fichier optimisé dans l&apos;onglet <strong>3D</strong> du projet, avec une image d&apos;attente
            (poster).
          </li>
        </ol>
        <p>Au-delà de 15 Mo le modèle se charge lentement sur mobile ; la limite est de 30 Mo.</p>
      </Guide>

      <Guide id="traduction" title="Traduire en anglais">
        <p>
          En haut de chaque formulaire, le bouton <strong>English</strong> affiche les mêmes champs en anglais. Le badge
          « EN manquant » signale les champs remplis en français mais pas en anglais ; tant qu&apos;une traduction
          manque, la version anglaise du site affiche le texte français.
        </p>
      </Guide>

      <Guide id="acces" title="Donner un accès">
        <ol>
          <li>
            Menu <strong>Utilisateurs et rôles</strong> : saisissez l&apos;adresse e-mail et le rôle, puis{" "}
            <strong>Inviter</strong>.
          </li>
          <li>
            Envoyez à la personne le lien <code>/admin/inscription</code> : elle crée son mot de passe et confirme son
            adresse.
          </li>
          <li>Son accès s&apos;active automatiquement avec le rôle choisi.</li>
        </ol>
      </Guide>
    </div>
  );
}
