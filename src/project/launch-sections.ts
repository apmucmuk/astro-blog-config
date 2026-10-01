export type LaunchService = {
  slug: string;
  title: string;
  description: string;
  status: "planned";
};

// Authoritative project launch data: docs/PROJECT_TRAGARZE.md §3.
export const launchServices: readonly LaunchService[] = [
  {
    slug: "przeprowadzki",
    title: "Przeprowadzki",
    description: "Przeprowadzki mieszkań, domów i firm.",
    status: "planned",
  },
  {
    slug: "tragarze",
    title: "Tragarze",
    description: "Pomoc tragarzy przy przenoszeniu, załadunku i rozładunku.",
    status: "planned",
  },
  {
    slug: "transport-z-tragarzami",
    title: "Transport z tragarzami",
    description: "Transport rzeczy wraz z pomocą przy załadunku i rozładunku.",
    status: "planned",
  },
] as const;
