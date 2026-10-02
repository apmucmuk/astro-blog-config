export type TocHeading = { depth: number; slug: string; text: string };
export type TocNode = TocHeading & { children: TocNode[] };

export function articleAsideLabel(hasToc: boolean) {
  return hasToc ? "Spis treści i informacje" : "Informacje o artykule";
}

export function articleToc(headings: readonly TocHeading[], enabled: boolean): TocNode[] {
  if (!enabled) return [];
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const heading of headings.filter((item) => item.depth >= 2 && item.depth <= 6)) {
    const node: TocNode = { ...heading, children: [] };
    while (stack.length && stack[stack.length - 1].depth >= node.depth) stack.pop();
    const parent = stack[stack.length - 1];
    (parent ? parent.children : roots).push(node);
    stack.push(node);
  }
  return roots;
}
