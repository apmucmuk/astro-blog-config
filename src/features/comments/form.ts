type Turnstile = {
  render: (container: HTMLElement, options: { sitekey: string; action: string; callback: (token: string) => void; "error-callback": () => void; "expired-callback": () => void }) => string;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: Turnstile; }
}

function status(target: HTMLElement, message: string): void {
  target.textContent = message;
}

export function mountCommentForm(form: HTMLFormElement): void {
  const siteKey = form.dataset.turnstileSiteKey;
  const apiUrl = form.dataset.apiUrl;
  const articleId = form.dataset.articleId;
  const state = form.querySelector<HTMLElement>("[data-comment-status]");
  const widget = form.querySelector<HTMLElement>("[data-turnstile-widget]");
  const submit = form.querySelector<HTMLButtonElement>("button[type=submit]");
  if (!apiUrl || !articleId || !state || !widget || !submit) return;
  if (!siteKey) {
    submit.disabled = true;
    status(state, "Komentarze są chwilowo niedostępne.");
    return;
  }

  let token = "";
  let widgetId = "";
  submit.disabled = true;
  status(state, "Ładowanie ochrony formularza…");

  const render = () => {
    if (!window.turnstile) { status(state, "Ochrona formularza jest chwilowo niedostępna."); return; }
    widgetId = window.turnstile.render(widget, {
      sitekey: siteKey,
      action: "comment",
      callback(value) { token = value; submit.disabled = false; status(state, ""); },
      "error-callback"() { token = ""; submit.disabled = true; status(state, "Nie udało się uruchomić ochrony formularza."); },
      "expired-callback"() { token = ""; submit.disabled = true; status(state, "Weryfikacja wygasła. Spróbuj ponownie."); },
    });
  };
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  script.onload = render;
  script.onerror = () => status(state, "Ochrona formularza jest chwilowo niedostępna.");
  document.head.append(script);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!token) { status(state, "Najpierw ukończ weryfikację."); return; }
    const data = new FormData(form);
    submit.disabled = true;
    status(state, "Wysyłanie komentarza…");
    try {
      const response = await fetch(new URL("/v1/comments", apiUrl), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, name: data.get("name"), body: data.get("body"), turnstileToken: token }),
      });
      const body = await response.json() as { status?: string; message?: string; error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message || "Nie udało się wysłać komentarza.");
      form.reset();
      token = "";
      if (widgetId) window.turnstile?.reset(widgetId);
      status(state, body.message || "Komentarz został opublikowany.");
      form.dispatchEvent(new CustomEvent("comment:created", { bubbles: true }));
    } catch (error) {
      status(state, error instanceof Error ? error.message : "Nie udało się wysłać komentarza.");
    } finally {
      if (token) submit.disabled = false;
    }
  });
}
