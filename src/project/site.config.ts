const apiUrl = import.meta.env.PUBLIC_API_URL ?? "https://api.tragarze.pl";

export const projectConfig = {
  project: "tragarze",
  siteId: "tragarze-pl",
  name: "tragarze.pl",
  locale: "pl",
  siteUrl: "https://tragarze.pl",
  apiUrl,
  originsAreProvisional: true,
} as const;
