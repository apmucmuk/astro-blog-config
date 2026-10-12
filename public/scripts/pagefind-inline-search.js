const maxQueryLength = 120;
const debounceMs = 250;

function normalizedQuery(value) {
  return value.trim().slice(0, maxQueryLength);
}

function createFilter(value) {
  const [name, expected] = value.split(":", 2);
  return name && expected ? { [name]: expected } : undefined;
}

// Future interactive tools must expose a static Astro page description with
// data-pagefind-filter="content_type:tool". Pagefind indexes that static HTML,
// never the state of a client-side island.

async function mountInlineSearch(root) {
  const form = root.querySelector("form");
  const input = root.querySelector("input[type='search']");
  const status = root.querySelector("[data-inline-search-status]");
  const results = root.querySelector("[data-inline-search-results]");
  const catalogId = root.dataset.searchCatalog;
  const catalog = catalogId ? document.getElementById(catalogId) : null;
  if (!form || !input || !status || !results || !catalog) return;

  let pagefind;
  let debounceTimer;
  let requestId = 0;

  async function loadPagefind() {
    if (!pagefind) {
      pagefind = await import("/pagefind/pagefind.js");
      await pagefind.options({ language: root.lang || document.documentElement.lang });
    }
    return pagefind;
  }

  function showCatalog() {
    catalog.hidden = false;
    results.hidden = true;
    status.hidden = true;
    results.replaceChildren();
  }

  function showResults(message) {
    catalog.hidden = true;
    results.hidden = false;
    status.hidden = false;
    status.textContent = message;
  }

  async function search(value) {
    const query = normalizedQuery(value);
    const currentRequest = ++requestId;
    results.replaceChildren();
    if (!query) {
      showCatalog();
      return;
    }

    showResults("Wyszukiwanie...");
    try {
      const response = await (await loadPagefind()).search(query, { filters: createFilter(root.dataset.searchFilter ?? "") });
      const items = await Promise.all(response.results.map((result) => result.data()));
      if (currentRequest !== requestId) return;
      for (const item of items) {
        const row = document.createElement("li");
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = item.meta.title ?? item.url;
        row.append(link);
        if (item.meta.description) {
          const description = document.createElement("p");
          description.textContent = item.meta.description;
          row.append(description);
        }
        results.append(row);
      }
      status.textContent = items.length ? `Znaleziono: ${items.length}.` : "Nie znaleziono wyników.";
    } catch {
      if (currentRequest === requestId) status.textContent = "Wyszukiwanie jest chwilowo niedostępne. Możesz nadal przeglądać katalog.";
    }
  }

  function scheduleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => { void search(input.value); }, debounceMs);
  }

  input.addEventListener("input", scheduleSearch);
  form.addEventListener("submit", (event) => { event.preventDefault(); clearTimeout(debounceTimer); void search(input.value); });
}

document.querySelectorAll("[data-inline-search]").forEach((root) => { void mountInlineSearch(root); });
