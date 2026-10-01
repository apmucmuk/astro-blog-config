import { seoLaunchEnabled } from "@core/seo/launch";

export const seoConfig = {
  defaultTitle: "tragarze.pl",
  defaultDescription: "Przeprowadzki, tragarze i praktyczne poradniki.",
  defaultLocale: "pl",
  launchEnabled: seoLaunchEnabled,
} as const;
