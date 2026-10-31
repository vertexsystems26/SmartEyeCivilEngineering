/**
 * Company facts from the reference brochure (brief, part 2).
 * Single source of truth until Firestore `settings/site` takes over in
 * phase 2; afterwards these values seed the back-office and act as fallback.
 * Never add facts here that are not in the brief.
 */
export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://smarteyecivilengineering.com").replace(/\/$/, ""),
  // Anything but an explicit production build is kept out of search engines.
  indexable: process.env.NEXT_PUBLIC_SITE_ENV === "production",
  shortName: "S.E.C.E",
  name: "S.E.C.E – Smart Eye Civil Engineering",
  legalName: "Smart Eye Civil Engineering",
  legalForm: "SARL",
  slogan: "We Build Your Dreams",
  founder: {
    name: "Hichem Haddad",
    since: { year: 2020, month: 12 }, // consulting engineer activity at S.E.C.E
    careerStartYear: 2005, // first position, 06/2005
  },
  address: {
    street: "N°8 bis, rue Apollo 11, App. B1, 1er étage, Mutuelleville",
    postalCode: "1082",
    city: "Tunis",
    countryCode: "TN",
    plusCode: "R5HH+49 Tunis",
  },
  phones: {
    mobile: { display: "+216 21 03 44 22", href: "tel:+21621034422" },
    landline: { display: "+216 70 295 055", href: "tel:+21670295055" },
  },
  email: "smarteyecivilengineering@gmail.com",
  social: {
    facebook: "https://www.facebook.com/S.E.C.E.sarl/",
  },
  // Enabled from the back-office (phase 2); off until the number is confirmed.
  whatsapp: null as string | null,
  themeColor: "#5d726f",
} as const;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.plusCode)}`;
