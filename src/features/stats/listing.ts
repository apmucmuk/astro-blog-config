import { fetchSnapshot } from "./snapshot";

export async function enhanceStats(root: HTMLElement) {
  const apiUrl = root.dataset.apiUrl;
  if (!apiUrl) return;
  const snapshot = await fetchSnapshot(apiUrl);
  if (!snapshot) return;
  const articles = new Map(snapshot.articles.map((article) => [article.id, article]));
  for (const item of root.querySelectorAll<HTMLElement>("[data-stats-id]")) {
    const stats = articles.get(item.dataset.statsId!);
    const counter = item.querySelector<HTMLElement>("[data-reads]");
    if (stats && counter) {
      counter.textContent = new Intl.NumberFormat(document.documentElement.lang).format(stats.reads);
      counter.parentElement!.hidden = false;
    }
  }
  const select = root.querySelector<HTMLSelectElement>("[data-stats-sort]");
  const list = root.querySelector<HTMLElement>("[data-stats-list]");
  if (!select || !list) return;
  const original = [...list.children] as HTMLElement[];
  const reorder = () => {
    const key = select.value as keyof typeof snapshot.rankings;
    const ranking = snapshot.rankings[key];
    const positions = new Map(ranking?.map((id, index) => [id, index]));
    const items = ranking ? [...original].sort((a, b) =>
      (positions.get(a.dataset.statsId!) ?? Infinity) - (positions.get(b.dataset.statsId!) ?? Infinity)) : original;
    list.append(...items);
  };
  select.disabled = false;
  select.addEventListener("change", reorder);
}
