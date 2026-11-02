import { options } from "../schema/helpers";
import type { FieldDef } from "../schema/types";

// Reference lists from the brochure and CV (brief §2 and appendix F).
export const STANDARDS = ["Eurocode", "ACI", "ASCE", "UBC / IBC"];
export const SOFTWARE = [
  "Arche (Graitec)",
  "Robot Millennium",
  "ETABS",
  "SAFE",
  "PCA",
  "CSI",
  "S-Concrete",
  "AutoCAD",
  "Armacad",
  "Revit Structure",
  "ComplyPro",
  "Aconex",
];

export const COUNTRIES = options({
  tunisie: "Tunisie",
  france: "France",
  "emirats-arabes-unis": "Émirats arabes unis",
  qatar: "Qatar",
  "arabie-saoudite": "Arabie saoudite",
  autre: "Autre",
});

export const STRUCTURE_TYPES = options({
  "beton-arme": "Béton armé",
  "charpente-metallique": "Charpente métallique",
  mixte: "Mixte béton / acier",
  "travaux-souterrains": "Travaux souterrains",
});

export const PHASES = options({
  esquisse: "Esquisse et faisabilité",
  "avant-projet": "Avant-projet",
  execution: "Études d'exécution",
  dce: "Dossier de consultation (DCE)",
  chantier: "Suivi de chantier",
  expertise: "Expertise / diagnostic",
});

export const SERVICE_ICONS = options({
  frame: "Ossature béton (poteaux, poutres)",
  steel: "Charpente métallique",
  road: "Voirie et réseaux",
  calc: "Calcul et modélisation",
  inspect: "Expertise (loupe)",
  site: "Chantier (casque)",
  docs: "Pièces écrites",
  value: "Ingénierie de la valeur",
});

export const seoField: FieldDef = {
  name: "seo",
  type: "seo",
  label: "Référencement",
  description:
    "Titre et description affichés par Google. Laissez vide pour utiliser automatiquement le titre et le résumé.",
};

export const toCompleteField: FieldDef = {
  name: "toComplete",
  type: "tags",
  label: "À compléter (interne)",
  description:
    "Informations manquantes à obtenir. Visible uniquement dans l'administration, jamais publié sur le site.",
};
