type Turnstile = {
  render: (container: HTMLElement, options: { sitekey: string; action: string; callback: (token: string) => void; "error-callback": () => void; "expired-callback": () => void }) => string;
  reset: (widgetId: string) => void;
};

export const COMMENT_NAME_MIN_LENGTH = 2;
export const COMMENT_NAME_MAX_LENGTH = 40;
export const COMMENT_BODY_MIN_LENGTH = 10;
export const COMMENT_BODY_MAX_LENGTH = 1500;

declare global {
  interface Window { turnstile?: Turnstile; }
}

function status(target: HTMLElement, message: string): void {
  target.textContent = message;
}

export function validateCommentForm(name: string, body: string): string | null {
  const normalizedName = name.trim();
  const normalizedBody = body.trim();
  if (normalizedName.length < COMMENT_NAME_MIN_LENGTH) return "Imię musi mieć co najmniej 2 znaki.";
  if (normalizedName.length > COMMENT_NAME_MAX_LENGTH) return "Imię może mieć maksymalnie 40 znaków.";
  if (normalizedBody.length < COMMENT_BODY_MIN_LENGTH) return "Komentarz musi mieć co najmniej 10 znaków.";
  if (normalizedBody.length > COMMENT_BODY_MAX_LENGTH) return "Komentarz może mieć maksymalnie 1500 znaków.";
  return null;
}

export function mountCommentForm(form: HTMLFormElement): void {
  const siteKey = form.dataset.turnstileSiteKey;
  const apiUrl = form.dataset.apiUrl;
  const articleId = form.dataset.articleId;
  const state = form.querySelector<HTMLElement>("[data-comment-status]");
  const widget = form.querySelector<HTMLElement>("[data-turnstile-widget]");
  const submit = form.querySelector<HTMLButtonElement>("button[type=submit]");
  const nameInput = form.querySelector<HTMLInputElement>("[name=name]");
  const bodyInput = form.querySelector<HTMLTextAreaElement>("[name=body]");
  const characterCount = form.querySelector<HTMLElement>("[data-comment-character-count]");
  if (!apiUrl || !articleId || !state || !widget || !submit) return;
  const updateCharacterCount = () => {
    if (bodyInput && characterCount) characterCount.textContent = `${bodyInput.value.length} / ${COMMENT_BODY_MAX_LENGTH}`;
  };
  updateCharacterCount();
  bodyInput?.addEventListener("input", updateCharacterCount);
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
    const validationMessage = validateCommentForm(nameInput?.value ?? "", bodyInput?.value ?? "");
    if (validationMessage) { status(state, validationMessage); return; }
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
      updateCharacterCount();
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
