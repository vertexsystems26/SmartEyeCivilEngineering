/*
 * Initial content, written ONLY from the brief's appendix (brochure + CV).
 * Nothing here may be invented: any missing fact stays empty and is listed in
 * `toComplete`, which the back-office shows and the site never publishes.
 * Document ids are the French slugs so a re-import updates instead of duplicating.
 */
import type { Localized, RichText } from "@/lib/cms/types";

const L = (fr: string, en: string): Localized => ({ fr, en });
const rich = (...paragraphs: string[]): RichText => ({
  type: "doc",
  content: paragraphs.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
});
const richL = (fr: string[], en: string[]) => ({ fr: rich(...fr), en: rich(...en) });
const seo = () => ({ title: L("", ""), description: L("", ""), image: null, noindex: false });

const TEXT_TODO = "Texte détaillé à rédiger (pédagogique, sans chiffre ni client inventé) puis relire";

/* ---------- Categories ---------- */

export const categories = [
  ["residentiel", "Résidentiel", "Residential"],
  ["tertiaire-bureaux", "Tertiaire et bureaux", "Offices and commercial"],
  ["sante", "Santé", "Healthcare"],
  ["education", "Éducation", "Education"],
  ["infrastructure", "Infrastructure", "Infrastructure"],
  ["equipements-publics", "Équipements publics", "Public facilities"],
  ["culture-loisirs", "Culture, sport et loisirs", "Culture, sport and leisure"],
  ["villa", "Villas", "Villas"],
].map(([id, fr, en], i) => ({
  id,
  data: {
    status: "published",
    name: L(fr, en),
    slug: L(
      id,
      en
        .toLowerCase()
        .replace(/[^a-z]+/g, "-")
        .replace(/-$/, ""),
    ),
    kind: "project",
    order: i + 1,
    toComplete: [],
  },
}));

categories.push({
  id: "articles-techniques",
  data: {
    status: "published",
    name: L("Articles techniques", "Technical articles"),
    slug: L("articles-techniques", "technical-articles"),
    kind: "post",
    order: 1,
    toComplete: [],
  },
});

/* ---------- Services (appendix A) ---------- */

type ServiceSeed = {
  id: string;
  en: string;
  title: Localized;
  summary: Localized;
  icon: string;
  software?: string[];
  standards?: string[];
  phases?: string[];
};

const serviceSeeds: ServiceSeed[] = [
  {
    id: "etude-structures-beton-arme",
    en: "reinforced-concrete-structural-design",
    title: L("Étude et conception de structures en béton armé", "Reinforced concrete structural design"),
    summary: L(
      "Conseil, étude, conception et calcul de structures pour bâtiments publics et privés et ouvrages de génie civil.",
      "Advice, design and calculation of structures for public and private buildings and civil engineering works.",
    ),
    icon: "frame",
    standards: ["Eurocode", "ACI", "ASCE", "UBC / IBC"],
    phases: ["esquisse", "avant-projet", "execution"],
  },
  {
    id: "charpente-metallique-structures-mixtes",
    en: "steel-and-composite-structures",
    title: L("Charpente métallique et structures mixtes", "Steel and composite structures"),
    summary: L(
      "Systèmes en acier et ouvrages mixtes béton / acier.",
      "Steel systems and composite concrete / steel structures.",
    ),
    icon: "steel",
  },
  {
    id: "vrd-voirie-reseaux-divers",
    en: "roads-and-utilities",
    title: L("VRD, voirie et réseaux divers", "Roads and utilities (VRD)"),
    summary: L(
      "Étude et conception des voiries et réseaux divers selon les codes du bâtiment.",
      "Design of roads and site utilities in line with building codes.",
    ),
    icon: "road",
  },
  {
    id: "calcul-modelisation",
    en: "structural-analysis-modelling",
    title: L("Calcul et modélisation", "Structural analysis and modelling"),
    summary: L(
      "Analyses, notes de calcul et modélisation avec Robot, ETABS, SAFE, Arche, PCA et S-Concrete.",
      "Analyses, calculation notes and modelling with Robot, ETABS, SAFE, Arche, PCA and S-Concrete.",
    ),
    icon: "calc",
    software: ["Robot Millennium", "ETABS", "SAFE", "Arche (Graitec)", "PCA", "S-Concrete"],
  },
  {
    id: "expertise-technique",
    en: "technical-assessment",
    title: L(
      "Expertise technique, revue de conception et intégrité structurelle",
      "Technical assessment, design review and structural integrity",
    ),
    summary: L(
      "Expertises, évaluation de l'intégrité structurelle de tous types de bâtiments, examen de la conception et visites de contrôle technique.",
      "Assessments, structural integrity evaluation of all types of buildings, design review and technical inspection visits.",
    ),
    icon: "inspect",
    phases: ["expertise"],
  },
  {
    id: "suivi-de-chantier",
    en: "site-supervision",
    title: L("Suivi de chantier et assistance technique", "Site supervision and technical assistance"),
    summary: L(
      "Pilotage de chantier, soutien opérationnel et technique aux différentes phases, du projet à l'exécution, dans les délais.",
      "Site management, operational and technical support at every phase, from design to construction, on schedule.",
    ),
    icon: "site",
    phases: ["chantier"],
  },
  {
    id: "pieces-ecrites-appels-offres",
    en: "tender-documents",
    title: L("Pièces écrites et appels d'offres techniques", "Specifications and technical tender documents"),
    summary: L(
      "Cahiers des charges, bordereaux, estimatifs et descriptifs.",
      "Specifications, bills of quantities, cost estimates and descriptions.",
    ),
    icon: "docs",
    phases: ["dce"],
  },
  {
    id: "ingenierie-de-la-valeur",
    en: "value-engineering",
    title: L("Ingénierie de la valeur (Value Engineering)", "Value engineering"),
    summary: L(
      "Une méthode pour résoudre les problèmes, éliminer les coûts indésirables et améliorer le fonctionnement et la qualité, avec la meilleure valeur au coût le plus bas.",
      "A method to solve problems, remove unwanted costs and improve function and quality, delivering the best value at the lowest cost.",
    ),
    icon: "value",
  },
];

export const services = serviceSeeds.map((s, i) => ({
  id: s.id,
  data: {
    status: "published",
    title: s.title,
    slug: L(s.id, s.en),
    order: i + 1,
    icon: s.icon,
    summary: s.summary,
    body: { fr: null, en: null },
    deliverables: { fr: [], en: [] },
    phases: s.phases ?? [],
    standards: s.standards ?? [],
    software: s.software ?? [],
    faq: [],
    seo: seo(),
    toComplete: [TEXT_TODO, "Livrables à valider", "FAQ du service"],
  },
}));

/* ---------- Projects (appendix B, C, D) ---------- */

type P = {
  id: string;
  en: string;
  title: Localized;
  summary: Localized;
  context: "sece" | "collaboration" | "engineer-experience";
  employer?: string;
  partner?: string;
  client?: string;
  country: string;
  city: Localized;
  start?: string;
  end?: string;
  area?: number;
  levels?: Localized;
  role?: Localized;
  categories: string[];
  services?: string[];
  structure?: string[];
  todo?: string[];
  draft?: boolean;
};

const ENGINEER_PRINCIPAL = L("Ingénieur principal structure", "Principal structural engineer");
const TN_2005 = {
  start: "06/2005",
  end: "08/2007",
  employer: "Bureau d'études, Tunis",
  role: L("Ingénieur adjoint en conception structurelle", "Assistant structural design engineer"),
};
const FR_TODO = ["Mission exacte de S.E.C.E", "Année ou période", "Photos"];

const projectSeeds: P[] = [
  // B — international references (engineer's experience before S.E.C.E)
  {
    id: "doha-metro-red-line-north",
    en: "doha-metro-red-line-north",
    title: L("Red Line North Underground (RLNU), métro de Doha", "Red Line North Underground (RLNU), Doha Metro"),
    summary: L(
      "Environ 13,4 km de tunnel à double forage et 7 stations, de Musheireb au Doha Golf Club par West Bay.",
      "About 13.4 km of twin-bore tunnel and 7 stations, from Musheireb to Doha Golf Club via West Bay.",
    ),
    context: "engineer-experience",
    employer: "SOCOTEC International",
    country: "qatar",
    city: L("Doha", "Doha"),
    start: "09/2014",
    end: "08/2018",
    role: L("Coordinateur technique structurel", "Structural technical coordinator"),
    categories: ["infrastructure"],
    structure: ["travaux-souterrains"],
  },
  {
    id: "louvre-abu-dhabi",
    en: "louvre-abu-dhabi",
    title: L("Louvre Abu Dhabi", "Louvre Abu Dhabi"),
    summary: L(
      "Environ 24 000 m² bâtis, sous un dôme en acier d'environ 180 m de diamètre.",
      "About 24,000 m² of built area under a steel dome of about 180 m in diameter.",
    ),
    context: "engineer-experience",
    employer: "Oger International Tunisie",
    country: "emirats-arabes-unis",
    city: L("Île de Saadiyat, Abu Dhabi", "Saadiyat Island, Abu Dhabi"),
    start: "09/2012",
    end: "02/2014",
    area: 24000,
    role: ENGINEER_PRINCIPAL,
    categories: ["culture-loisirs"],
    structure: ["charpente-metallique"],
  },
  {
    id: "haramain-high-speed-railway",
    en: "haramain-high-speed-railway",
    title: L("Haramain High-Speed Railway", "Haramain High-Speed Railway"),
    summary: L(
      "Ligne électrique de 450 km à 300 km/h, 4 gares principales en béton armé et charpente métallique.",
      "450 km electric line at 300 km/h, with 4 main stations in reinforced concrete and steel.",
    ),
    context: "engineer-experience",
    employer: "Saudi Oger / Oger International",
    country: "arabie-saoudite",
    city: L("Djeddah", "Jeddah"),
    start: "09/2011",
    end: "09/2012",
    role: L(
      "Ingénieur principal structure : coordination, dossier d'exécution, approbations du bureau de contrôle Dar Al Handassa",
      "Principal structural engineer: coordination, construction documents, approvals by the Dar Al Handassa checking office",
    ),
    categories: ["infrastructure"],
    structure: ["beton-arme", "charpente-metallique"],
  },
  {
    id: "abu-dhabi-financial-centre",
    en: "abu-dhabi-financial-centre",
    title: L("Abu Dhabi Financial Centre (Sowwah Square)", "Abu Dhabi Financial Centre (Sowwah Square)"),
    summary: L(
      "460 000 m² à usage mixte : 4 tours de bureaux de 34 étages, Bourse d'Abu Dhabi, commerces et 2 parkings de 5 étages.",
      "460,000 m² mixed-use: 4 office towers of 34 storeys, the Abu Dhabi Securities Exchange, retail and 2 five-storey car parks.",
    ),
    context: "engineer-experience",
    employer: "Oger International Abu Dhabi",
    country: "emirats-arabes-unis",
    city: L("Al Maryah Island, Abu Dhabi", "Al Maryah Island, Abu Dhabi"),
    start: "05/2008",
    end: "05/2011",
    area: 460000,
    levels: L("Tours de 34 étages", "34-storey towers"),
    role: L(
      "Ingénieur principal structure (conception et construction)",
      "Principal structural engineer (design and construction)",
    ),
    categories: ["tertiaire-bureaux"],
  },
  {
    id: "campus-universitaire-al-ain",
    en: "al-ain-university-campus",
    title: L("Nouveau campus universitaire d'Al Ain", "New Al Ain university campus"),
    summary: L("32 bâtiments, 305 220 m².", "32 buildings, 305,220 m²."),
    context: "engineer-experience",
    employer: "International Consulting Compagnie (sous-traitant d'Oger International Paris)",
    country: "emirats-arabes-unis",
    city: L("Al Ain, Abu Dhabi", "Al Ain, Abu Dhabi"),
    start: "09/2007",
    end: "03/2008",
    area: 305220,
    role: L("Ingénieur structure résident", "Resident structural engineer"),
    categories: ["education"],
  },
  {
    id: "seaworld-abu-dhabi",
    en: "seaworld-abu-dhabi",
    title: L("SeaWorld Abu Dhabi", "SeaWorld Abu Dhabi"),
    summary: L(
      "Parc à thème : contrôle d'étude structurelle et inspection de chantier. Propriétaire MIRAL, consultant AECOM Moyen-Orient.",
      "Theme park: structural design review and site inspection. Owner MIRAL, consultant AECOM Middle East.",
    ),
    context: "engineer-experience",
    employer: "SOCOTEC International Abu Dhabi",
    client: "MIRAL",
    country: "emirats-arabes-unis",
    city: L("Île de Yas, Abu Dhabi", "Yas Island, Abu Dhabi"),
    start: "08/2018",
    end: "07/2020",
    role: ENGINEER_PRINCIPAL,
    categories: ["culture-loisirs"],
    services: ["expertise-technique"],
  },
  {
    id: "waterfront",
    en: "waterfront",
    title: L("Waterfront (aménagement)", "Waterfront development"),
    summary: L(
      "Sous-sol, rez-de-chaussée, mezzanine, 2 podiums et 25 étages types. Propriétaire LINK Investments, consultant EWAN.",
      "Basement, ground floor, mezzanine, 2 podium levels and 25 typical floors. Owner LINK Investments, consultant EWAN.",
    ),
    context: "engineer-experience",
    employer: "SOCOTEC International Abu Dhabi",
    client: "LINK Investments",
    country: "emirats-arabes-unis",
    city: L("", ""),
    start: "08/2018",
    end: "07/2020",
    levels: L(
      "Sous-sol + RDC + mezzanine + 2 podiums + 25 étages",
      "Basement + GF + mezzanine + 2 podiums + 25 floors",
    ),
    categories: [],
    todo: ["Lieu exact (à confirmer)", "Rôle de l'ingénieur", "Catégorie"],
    draft: true,
  },
  {
    id: "solar-decathlon-middle-east-2018",
    en: "solar-decathlon-middle-east-2018",
    title: L("Solar Decathlon Middle East 2018", "Solar Decathlon Middle East 2018"),
    summary: L(
      "Contrôle technique et suivi des chantiers, aide aux équipes d'étudiants de différentes universités.",
      "Technical inspection and site follow-up, supporting student teams from several universities.",
    ),
    context: "engineer-experience",
    employer: "SOCOTEC International Abu Dhabi",
    country: "emirats-arabes-unis",
    city: L("", ""),
    start: "2018",
    end: "2018",
    categories: [],
    todo: ["Ville", "Catégorie"],
    draft: true,
  },
  // C — France, collaborations during the S.E.C.E period
  {
    id: "93-logements-chennevieres-sur-marne",
    en: "93-apartments-chennevieres-sur-marne",
    title: L("Immeuble de 93 logements", "93-apartment building"),
    summary: L(
      "2 sous-sols, rez-de-chaussée et 4 étages ; 1 450 m² au rez-de-chaussée.",
      "2 basements, ground floor and 4 storeys; 1,450 m² at ground level.",
    ),
    context: "collaboration",
    partner: "BATIS ingénierie",
    country: "france",
    city: L("Chennevières-sur-Marne (94430)", "Chennevières-sur-Marne (94430)"),
    levels: L("2 sous-sols + RDC + 4 étages", "2 basements + GF + 4 floors"),
    categories: ["residentiel"],
    todo: FR_TODO,
  },
  {
    id: "17-logements-epinay-sur-seine",
    en: "17-apartments-epinay-sur-seine",
    title: L("Immeuble de 17 logements", "17-apartment building"),
    summary: L("1 sous-sol, rez-de-chaussée, 4 étages et combles.", "1 basement, ground floor, 4 storeys and attic."),
    context: "collaboration",
    partner: "BET AGEXIS",
    country: "france",
    city: L("Épinay-sur-Seine (93800)", "Épinay-sur-Seine (93800)"),
    levels: L("1 sous-sol + RDC + 4 étages + combles", "1 basement + GF + 4 floors + attic"),
    categories: ["residentiel"],
    todo: FR_TODO,
  },
  {
    id: "10-logements-epinay-sur-seine",
    en: "10-apartments-epinay-sur-seine",
    title: L("Immeuble de 10 logements", "10-apartment building"),
    summary: L("1 sous-sol, rez-de-chaussée, 4 étages et combles.", "1 basement, ground floor, 4 storeys and attic."),
    context: "collaboration",
    partner: "BET AGEXIS",
    country: "france",
    city: L("Épinay-sur-Seine (93800)", "Épinay-sur-Seine (93800)"),
    levels: L("1 sous-sol + RDC + 4 étages + combles", "1 basement + GF + 4 floors + attic"),
    categories: ["residentiel"],
    todo: FR_TODO,
  },
  {
    id: "5-logements-epinay-sur-seine",
    en: "5-apartments-epinay-sur-seine",
    title: L("Immeuble de 5 logements", "5-apartment building"),
    summary: L("1 sous-sol, rez-de-chaussée, 2 étages et combles.", "1 basement, ground floor, 2 storeys and attic."),
    context: "collaboration",
    partner: "BET AGEXIS",
    country: "france",
    city: L("Épinay-sur-Seine (93800)", "Épinay-sur-Seine (93800)"),
    levels: L("1 sous-sol + RDC + 2 étages + combles", "1 basement + GF + 2 floors + attic"),
    categories: ["residentiel"],
    todo: FR_TODO,
  },
  {
    id: "immeuble-activites-sportives-colombes",
    en: "sports-building-colombes",
    title: L("Immeuble d'activités sportives, îlot Colombus, lot 25", "Sports building, Colombus block, lot 25"),
    summary: L(
      "R+6 : 2 niveaux de parking, 2 niveaux d'activités sportives et terrains de football en salle aux 5e et 6e étages (6,92 m sous plafond).",
      "G+6: 2 parking levels, 2 sports levels and indoor football pitches on the 5th and 6th floors (6.92 m clear height).",
    ),
    context: "collaboration",
    partner: "BATIS ingénierie",
    country: "france",
    city: L("Colombes (92)", "Colombes (92)"),
    levels: L("R+6", "G+6"),
    categories: ["culture-loisirs"],
    todo: FR_TODO,
  },
  {
    id: "ensemble-immobilier-creteil",
    en: "residential-complex-creteil",
    title: L("Ensemble immobilier, rue Seguin", "Residential complex, rue Seguin"),
    summary: L("", ""),
    context: "collaboration",
    country: "france",
    city: L("Créteil (94)", "Créteil (94)"),
    categories: [],
    todo: ["Résumé et caractéristiques", "Partenaire de la collaboration", "Mission", "Année", "Catégorie", "Photos"],
    draft: true,
  },
  // D — Tunisia
  {
    id: "extension-hopital-razi",
    en: "razi-hospital-extension",
    title: L("Extension de l'hôpital Razi", "Razi Hospital extension"),
    summary: L("", ""),
    context: "sece",
    country: "tunisie",
    city: L("La Manouba", "La Manouba"),
    categories: ["sante"],
    todo: ["Mission de S.E.C.E", "Résumé", "Année", "Photos"],
    draft: true,
  },
  {
    id: "palais-municipal-ettadhamen",
    en: "ettadhamen-town-hall",
    title: L("Palais municipal d'Ettadhamen", "Ettadhamen town hall"),
    summary: L("Expertise technique complète du bâtiment.", "Full technical assessment of the building."),
    context: "sece",
    country: "tunisie",
    city: L("Ettadhamen, Tunis", "Ettadhamen, Tunis"),
    role: L("Expertise technique complète", "Full technical assessment"),
    categories: ["equipements-publics"],
    services: ["expertise-technique"],
    todo: ["Année", "Photos"],
  },
  {
    id: "villas-prestigieuses",
    en: "high-end-villas",
    title: L("Villas prestigieuses", "High-end villas"),
    summary: L("", ""),
    context: "sece",
    country: "tunisie",
    city: L("", ""),
    categories: ["villa"],
    todo: ["Mission de S.E.C.E", "Lieu", "Résumé", "Photos"],
    draft: true,
  },
  {
    id: "iset-medenine",
    en: "iset-medenine",
    title: L(
      "Institut supérieur des études technologiques de Médenine",
      "Higher Institute of Technological Studies, Medenine",
    ),
    summary: L(
      "Campus universitaire : étude et conception, coordination, appels d'offres techniques.",
      "University campus: design, coordination and technical tender documents.",
    ),
    context: "engineer-experience",
    country: "tunisie",
    city: L("Médenine", "Medenine"),
    ...TN_2005,
    categories: ["education"],
    services: ["etude-structures-beton-arme", "pieces-ecrites-appels-offres"],
  },
  {
    id: "hopital-ben-arous",
    en: "ben-arous-hospital",
    title: L("Hôpital de Ben Arous", "Ben Arous Hospital"),
    summary: L("Étude et conception, coordination.", "Design and coordination."),
    context: "engineer-experience",
    country: "tunisie",
    city: L("Ben Arous", "Ben Arous"),
    ...TN_2005,
    categories: ["sante"],
    services: ["etude-structures-beton-arme"],
  },
  {
    id: "centre-protection-enfance-ezzahrouni",
    en: "ezzahrouni-child-protection-centre",
    title: L("Centre de protection de l'enfance d'Ezzahrouni", "Ezzahrouni child protection centre"),
    summary: L(
      "Étude et conception, coordination, appels d'offres et suivi de site.",
      "Design, coordination, tender documents and site follow-up.",
    ),
    context: "engineer-experience",
    country: "tunisie",
    city: L("Ezzahrouni, Tunis", "Ezzahrouni, Tunis"),
    ...TN_2005,
    categories: ["equipements-publics"],
    services: ["etude-structures-beton-arme", "pieces-ecrites-appels-offres", "suivi-de-chantier"],
  },
  {
    id: "centre-tic-el-ghazala",
    en: "el-ghazala-ict-centre",
    title: L(
      "Centre de développement des technologies de l'information et de la communication, pôle El Ghazala",
      "Information and communication technology development centre, El Ghazala technology park",
    ),
    summary: L("Étude structurale, coordination.", "Structural design and coordination."),
    context: "engineer-experience",
    country: "tunisie",
    city: L("El Ghazala, Ariana", "El Ghazala, Ariana"),
    ...TN_2005,
    categories: ["tertiaire-bureaux"],
    services: ["etude-structures-beton-arme"],
  },
  {
    id: "salle-de-boxe-ras-tabia",
    en: "ras-tabia-boxing-hall",
    title: L("Salle de boxe de Ras Tabia", "Ras Tabia boxing hall"),
    summary: L("Étude et conception, coordination.", "Design and coordination."),
    context: "engineer-experience",
    country: "tunisie",
    city: L("Ras Tabia, Tunis", "Ras Tabia, Tunis"),
    ...TN_2005,
    categories: ["culture-loisirs"],
    services: ["etude-structures-beton-arme"],
  },
  {
    id: "espace-entreprises-el-ghazala",
    en: "el-ghazala-business-centre",
    title: L("Espace des entreprises privées, pôle El Ghazala", "Private business centre, El Ghazala technology park"),
    summary: L("Étude et conception, coordination.", "Design and coordination."),
    context: "engineer-experience",
    country: "tunisie",
    city: L("El Ghazala, Ariana", "El Ghazala, Ariana"),
    ...TN_2005,
    categories: ["tertiaire-bureaux"],
    services: ["etude-structures-beton-arme"],
  },
];

export const projects = projectSeeds.map((p, i) => ({
  id: p.id,
  data: {
    status: p.draft ? "draft" : "published",
    title: p.title,
    slug: L(p.id, p.en),
    featured: [
      "doha-metro-red-line-north",
      "louvre-abu-dhabi",
      "abu-dhabi-financial-centre",
      "palais-municipal-ettadhamen",
    ].includes(p.id),
    order: i + 1,
    categories: p.categories,
    summary: p.summary,
    context: p.context,
    partner: p.partner ?? "",
    employer: p.employer ?? "",
    client: p.client ?? "",
    country: p.country,
    city: p.city,
    periodStart: p.start ?? "",
    periodEnd: p.end ?? "",
    area: p.area ?? null,
    levels: p.levels ?? L("", ""),
    structureType: p.structure ?? [],
    role: p.role ?? L("", ""),
    services: p.services ?? [],
    standards: [],
    software: [],
    partners: "",
    body: { fr: null, en: null },
    cover: null,
    gallery: [],
    videoUrl: "",
    model: { file: null, poster: null, autoRotate: true, cameraOrbit: "", exposure: 1, hotspots: [] },
    seo: seo(),
    toComplete: [
      ...(p.todo ?? []),
      "Texte du projet (250 mots minimum)",
      ...(p.todo?.includes("Photos") ? [] : ["Photos"]),
    ],
  },
}));

/* ---------- Posts: six empty launch drafts (brief §8.5) ---------- */

export const posts = [
  [
    "etude-structure-beton-arme-etapes-projet-tunis",
    "reinforced-concrete-structural-design-project-steps-tunis",
    "Étude de structure en béton armé : les étapes d'un projet à Tunis",
    "Reinforced concrete structural design: the steps of a project in Tunis",
  ],
  [
    "eurocode-2-aci-318-differences",
    "eurocode-2-vs-aci-318-differences",
    "Eurocode 2 et ACI 318 : quelles différences pour votre projet ?",
    "Eurocode 2 and ACI 318: what differences for your project?",
  ],
  [
    "ingenierie-de-la-valeur-batiment",
    "value-engineering-in-construction",
    "Qu'est-ce que l'ingénierie de la valeur dans le bâtiment ?",
    "What is value engineering in construction?",
  ],
  [
    "expertise-technique-batiment-quand-la-demander",
    "building-technical-assessment-when-to-request-one",
    "Expertise technique d'un bâtiment : quand la demander ?",
    "Building technical assessment: when should you request one?",
  ],
  [
    "charpente-metallique-ou-beton-arme",
    "steel-or-reinforced-concrete",
    "Charpente métallique ou béton armé : comment choisir ?",
    "Steel or reinforced concrete: how to choose?",
  ],
  [
    "role-ingenieur-conseil-suivi-de-chantier",
    "consulting-engineer-role-site-supervision",
    "Le rôle de l'ingénieur conseil dans le suivi de chantier",
    "The consulting engineer's role in site supervision",
  ],
].map(([id, en, fr, enTitle]) => ({
  id,
  data: {
    status: "draft",
    title: L(fr, enTitle),
    slug: L(id, en),
    category: "articles-techniques",
    excerpt: L("", ""),
    body: { fr: null, en: null },
    cover: null,
    author: "Hichem Haddad",
    date: "",
    related: [],
    seo: seo(),
    toComplete: ["Article à rédiger par S.E.C.E", "Chapô", "Image de couverture", "Date de publication"],
  },
}));

/* ---------- About page (brief §2, appendix E and F) ---------- */

export const about = {
  status: "published",
  intro: richL(
    [
      "S.E.C.E (Smart Eye Civil Engineering) est une société d'ingénierie de la construction et un bureau d'études implanté à Tunis. Elle réalise des études et des missions d'ingénierie de structures en béton armé pour tous types de bâtiments publics et privés et d'ouvrages de génie civil.",
      "Son ingénieur conseil apporte une large expérience locale et internationale : immeubles résidentiels et commerciaux de grande hauteur, tours, hôtels, hôpitaux, charpente métallique, bâtiments industriels, travaux souterrains et mégaprojets.",
    ],
    [
      "S.E.C.E (Smart Eye Civil Engineering) is a construction engineering company and design office based in Tunis. It carries out reinforced concrete structural design and engineering assignments for all types of public and private buildings and civil engineering works.",
      "Its consulting engineer brings broad local and international experience: high-rise residential and commercial buildings, towers, hotels, hospitals, steel structures, industrial buildings, underground works and megaprojects.",
    ],
  ),
  mission: { fr: null, en: null },
  values: [
    {
      title: L("Une équipe jeune et qualifiée", "A young, qualified team"),
      text: L(
        "Une équipe jeune, expérimentée et qualifiée, attentive au rythme du développement technologique, économique et durable.",
        "A young, experienced and qualified team, attentive to technological, economic and sustainable development.",
      ),
    },
    {
      title: L("Des solutions adaptées", "Tailored solutions"),
      text: L(
        "Des solutions techniques adaptées aux besoins de chaque client.",
        "Technical solutions tailored to each client's needs.",
      ),
    },
    {
      title: L("Délais et éthique", "Deadlines and ethics"),
      text: L(
        "Le respect des délais et du code d'éthique de l'ingénierie.",
        "Respect for deadlines and for the engineering code of ethics.",
      ),
    },
    {
      title: L("Présence sur le chantier", "On-site follow-up"),
      text: L("Le suivi des problèmes et des difficultés du chantier.", "Follow-up of site issues and difficulties."),
    },
  ],
  valueEngineering: richL(
    [
      "L'ingénierie de la valeur (Value Engineering) est une méthode appliquée par S.E.C.E pour résoudre les problèmes, identifier et éliminer les coûts indésirables, et améliorer le fonctionnement et la qualité.",
      "Ses étapes disciplinées visent à optimiser l'investissement initial et à long terme, pour obtenir la meilleure valeur possible au coût le plus bas.",
    ],
    [
      "Value engineering is a method S.E.C.E applies to solve problems, identify and remove unwanted costs, and improve function and quality.",
      "Its disciplined steps aim to optimise both initial and long-term investment, to achieve the best possible value at the lowest cost.",
    ],
  ),
  standards: ["Eurocode", "ACI", "ASCE", "UBC / IBC"],
  software: [
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
    "Word",
    "Excel",
  ],
  founder: {
    name: "Hichem Haddad",
    title: L("Ingénieur conseil structures (agréé)", "Chartered structural consulting engineer"),
    photo: null,
    bio: { fr: null, en: null },
  },
  education: [
    {
      title: L("Diplôme d'ingénieur d'État", "State engineering degree"),
      school: "Institut Supérieur Polytechnique Privé de Tunis (ISPPT)",
      year: "2015",
    },
    { title: L("", ""), school: "Institut Supérieur d'Études Technologiques de Radès (ISET Radès)", year: "2005" },
  ],
  memberships: [
    { label: L("Ordre des Ingénieurs Tunisiens", "Order of Tunisian Engineers"), number: "52292", validated: false },
    {
      label: L("Liste des ingénieurs conseil agréés tunisiens", "Register of Tunisian chartered consulting engineers"),
      number: "0695",
      validated: false,
    },
    {
      label: L(
        "Ex-membre de la Society of Engineers (Émirats arabes unis)",
        "Former member of the Society of Engineers (UAE)",
      ),
      number: "58802",
      validated: false,
    },
  ],
  languages: [
    { language: L("Arabe", "Arabic"), level: L("Langue maternelle", "Native") },
    { language: L("Anglais", "English"), level: L("Courant", "Fluent") },
    { language: L("Français", "French"), level: L("Courant", "Fluent") },
  ],
  qualities: {
    fr: [
      "Sens des responsabilités",
      "Résolution de problèmes",
      "Gestion du temps",
      "Esprit d'équipe",
      "Créativité",
      "Adaptabilité",
      "Autonomie et résistance à la pression",
    ],
    en: [
      "Sense of responsibility",
      "Problem solving",
      "Time management",
      "Team spirit",
      "Creativity",
      "Adaptability",
      "Autonomy and resilience under pressure",
    ],
  },
  timeline: [
    {
      start: "12/2020",
      end: "",
      organization: "S.E.C.E",
      location: "Tunis",
      role: L(
        "Ingénieur conseil agréé : conseil, étude, conception et calcul de structures, expertise technique, pilotage de chantier, pièces écrites",
        "Chartered consulting engineer: advice, structural design and calculation, technical assessment, site management, specifications",
      ),
      project: L("", ""),
    },
    {
      start: "08/2018",
      end: "07/2020",
      organization: "SOCOTEC International",
      location: "Abu Dhabi",
      role: ENGINEER_PRINCIPAL,
      project: L("SeaWorld Abu Dhabi, Waterfront", "SeaWorld Abu Dhabi, Waterfront"),
    },
    {
      start: "09/2014",
      end: "08/2018",
      organization: "SOCOTEC International",
      location: "Abu Dhabi, Doha",
      role: L("Coordinateur technique structurel", "Structural technical coordinator"),
      project: L("Métro de Doha, Red Line North", "Doha Metro, Red Line North"),
    },
    {
      start: "09/2012",
      end: "02/2014",
      organization: "Oger International Tunisie",
      location: "Abu Dhabi",
      role: ENGINEER_PRINCIPAL,
      project: L("Louvre Abu Dhabi", "Louvre Abu Dhabi"),
    },
    {
      start: "09/2011",
      end: "09/2012",
      organization: "Oger International Tunisie / Saudi Oger",
      location: "Djeddah",
      role: ENGINEER_PRINCIPAL,
      project: L("Haramain High-Speed Railway", "Haramain High-Speed Railway"),
    },
    {
      start: "05/2008",
      end: "05/2011",
      organization: "Oger International Abu Dhabi",
      location: "Abu Dhabi",
      role: ENGINEER_PRINCIPAL,
      project: L("Abu Dhabi Financial Centre", "Abu Dhabi Financial Centre"),
    },
    {
      start: "09/2007",
      end: "03/2008",
      organization: "International Consulting Compagnie",
      location: "Al Ain",
      role: L("Ingénieur structure résident", "Resident structural engineer"),
      project: L("Campus universitaire d'Al Ain", "Al Ain university campus"),
    },
    {
      start: "06/2005",
      end: "08/2007",
      organization: "Bureau d'études",
      location: "Tunis",
      role: L(
        "Ingénieur adjoint en conception structurelle (béton armé, charpente métallique, VRD)",
        "Assistant structural design engineer (reinforced concrete, steel, roads and utilities)",
      ),
      project: L("", ""),
    },
  ],
  seo: seo(),
  toComplete: [
    "Photo de Hichem Haddad",
    "Biographie de l'ingénieur conseil",
    "Intitulé du diplôme ISET Radès (2005)",
    "Valider les adhésions avant publication (cocher « Validée »)",
    "Texte de mission (facultatif)",
  ],
};
