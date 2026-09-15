export type PublishableEntry = {
  data: {
    draft?: boolean;
    publishDate: Date | string;
  };
};

export function isPublished(entry: PublishableEntry, now = new Date()): boolean {
  if (entry.data.draft === true) {
    return false;
  }

  return new Date(entry.data.publishDate).getTime() <= now.getTime();
}

export function filterPublished<TEntry extends PublishableEntry>(
  entries: TEntry[],
  now = new Date(),
): TEntry[] {
  return entries.filter((entry) => isPublished(entry, now));
}
