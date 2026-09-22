import { fetchSnapshot } from "./snapshot";
import { collectionPage, listingUrl, type ListingEntry } from "./collection";

export async function enhanceStats(root: HTMLElement) {
  const apiUrl = root.dataset.apiUrl;
  if (!apiUrl) return;
  if (root.dataset.manifestUrl) {
    mountListing(root, apiUrl);
    return;
  }
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
}

function mountListing(root: HTMLElement, apiUrl: string) {
  const select = root.querySelector<HTMLSelectElement>("[data-stats-sort]")!;
  const list = root.querySelector<HTMLElement>("[data-stats-list]")!;
  const navigation = root.querySelector<HTMLElement>("[data-stats-pagination]")!;
  const error = root.querySelector<HTMLElement>("[data-stats-error]")!;
  const empty = root.querySelector<HTMLElement>("[data-stats-empty]")!;
  const template = root.querySelector<HTMLTemplateElement>("[data-stats-card]")!;
  const base = root.dataset.base!;
  const pageSize = Number(root.dataset.pageSize);
  const original = list.innerHTML;
  const originalNavigation = navigation.innerHTML;
  const initialPath = location.pathname;
  let manifest: Promise<ListingEntry[]> | undefined;
  let generation = 0;
  function loadManifest() {
    return manifest ??= fetch(root.dataset.manifestUrl!).then(async (response) => {
      if (!response.ok) throw new Error("Listing unavailable");
      const entries = await response.json() as ListingEntry[];
      if (!Array.isArray(entries) || entries.some((entry) => !entry.id || typeof entry.title !== "string" || !/^https?:/.test(entry.url))) throw new Error("Invalid listing");
      return entries;
    });
  }
  async function render() {
    const current = ++generation;
    const url = new URL(location.href);
    const requested = url.searchParams.get("sort") ?? "newest";
    const sort = [...select.options].some((option) => option.value === requested) ? requested : "newest";
    const page = Number(url.pathname.match(/\/page\/(\d+)\/$/)?.[1] ?? 1);
    select.value = sort;
    error.hidden = true;
    if (sort === "newest" && url.pathname === initialPath) {
      list.innerHTML = original; navigation.innerHTML = originalNavigation; empty.hidden = true;
      return;
    }
    try {
      const [entries, snapshot] = await Promise.all([loadManifest(), sort === "newest" || sort === "updated" ? null : fetchSnapshot(apiUrl)]);
      const category = root.dataset.category;
      const person = root.dataset.person;
      const result = collectionPage(entries, sort, page, pageSize, root.dataset.locale!, snapshot, (entry) =>
        (!category || entry.category === category) && (!person || entry.authors.includes(person)));
      if (current !== generation) return;
      const fragments = result.items.map((entry) => {
        const item = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        item.dataset.statsId = entry.id;
        const link = item.querySelector("a")!;
        link.href = entry.url; link.textContent = entry.title;
        item.querySelector("[data-description]")!.textContent = entry.description;
        const stats = snapshot?.articles.find((article) => article.id === entry.id);
        if (stats) {
          const counter = item.querySelector<HTMLElement>("[data-reads]")!;
          counter.textContent = new Intl.NumberFormat(root.dataset.locale).format(stats.reads);
          counter.parentElement!.hidden = false;
        }
        return item;
      });
      list.replaceChildren(...fragments);
      empty.hidden = result.items.length > 0;
      navigation.replaceChildren(...Array.from({ length: Math.ceil(result.total / pageSize) }, (_, index) => {
        const link = document.createElement("a");
        link.href = listingUrl(base, index + 1, sort); link.textContent = String(index + 1);
        if (index + 1 === page) link.setAttribute("aria-current", "page");
        return link;
      }));
    } catch {
      if (current !== generation) return;
      list.innerHTML = original; navigation.innerHTML = originalNavigation;
      select.value = "newest"; empty.hidden = true; error.hidden = false;
      history.replaceState(null, "", initialPath);
    }
  }
  select.disabled = false;
  select.addEventListener("change", () => { history.pushState(null, "", listingUrl(base, 1, select.value)); void render(); });
  navigation.addEventListener("click", (event) => {
    const link = (event.target as HTMLElement).closest("a");
    if (!link || (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey || (event as MouseEvent).button !== 0) return;
    event.preventDefault(); history.pushState(null, "", link.href); void render();
  });
  window.addEventListener("popstate", () => { void render(); });
  void render();
}
