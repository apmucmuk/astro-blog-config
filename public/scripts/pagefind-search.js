const maxQueryLength = 120;

function normalizedQuery(value) {
  return value.trim().slice(0, maxQueryLength);
}

async function mountSearch(root) {
  const form = root.querySelector("form");
  const input = root.querySelector("input[type='search']");
  const status = root.querySelector("[data-search-status]");
  const results = root.querySelector("[data-search-results]");
  if (!form || !input || !status || !results) return;

  const url = new URL(window.location.href);
  input.value = normalizedQuery(url.searchParams.get("q") ?? "");
  let pagefind;

  async function loadPagefind() {
    if (!pagefind) {
      pagefind = await import("/pagefind/pagefind.js");
      await pagefind.options({ language: root.lang || document.documentElement.lang });
    }
    return pagefind;
  }

  async function search(query) {
    results.replaceChildren();
    if (!query) {
      status.textContent = "Wpisz frazę, aby rozpocząć wyszukiwanie.";
      return;
    }

    status.textContent = "Wyszukiwanie...";
    try {
      const response = await (await loadPagefind()).search(query);
      const items = await Promise.all(response.results.map((result) => result.data()));
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
      status.textContent = "Wyszukiwanie jest chwilowo niedostępne. Możesz nadal przeglądać poradniki.";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = normalizedQuery(input.value);
    const next = new URL(window.location.href);
    if (query) next.searchParams.set("q", query);
    else next.searchParams.delete("q");
    window.history.replaceState({}, "", next);
    void search(query);
  });

  if (input.value) await search(input.value);
}

document.querySelectorAll("[data-search-root]").forEach((root) => { void mountSearch(root); });
