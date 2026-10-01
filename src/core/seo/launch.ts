/** Build-time release switch. Defaults to fail-closed until a reviewed SEO launch. */
export const seoLaunchEnabled = import.meta.env.SEO_LAUNCH_ENABLED === "true";

export const defaultRobots = seoLaunchEnabled ? "index,follow" : "noindex,follow";
