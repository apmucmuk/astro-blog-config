import type { CommentsListResponse, PublicComment } from "@core/api";

type CommentSurface = HTMLElement & { dataset: DOMStringMap };

function safeUrl(value: string): URL | null {
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url : null; } catch { return null; }
}

function appendBody(target: HTMLElement, body: string, linkRel: PublicComment["linkRel"]): void {
  const expression = /https?:\/\/[^\s<>"']+/gi;
  let from = 0;
  for (const match of body.matchAll(expression)) {
    const url = safeUrl(match[0]);
    const index = match.index ?? 0;
    target.append(body.slice(from, index));
    if (url) {
      const link = document.createElement("a"); link.href = url.href; link.textContent = match[0];
      if (linkRel === "nofollow" || linkRel === "sponsored") link.rel = linkRel;
      target.append(link);
    } else target.append(match[0]);
    from = index + match[0].length;
  }
  target.append(body.slice(from));
}

function commentElement(comment: PublicComment, apiUrl: string, onChange: () => void): HTMLLIElement {
  const item = document.createElement("li"); item.className = "comment-item"; item.dataset.commentId = comment.id;
  const heading = document.createElement("p"); const name = document.createElement("strong"); name.textContent = comment.name;
  const time = document.createElement("time"); time.dateTime = comment.createdAt; time.textContent = new Date(comment.createdAt).toLocaleDateString("pl-PL");
  heading.append(name, " · ", time); const body = document.createElement("p"); appendBody(body, comment.body, comment.linkRel);
  const actions = document.createElement("p");
  for (const [label, action] of [[`Pomocne (${comment.helpfulCount})`, "helpful"], ["Zgłoś", "report"]] as const) {
    const button = document.createElement("button"); button.type = "button"; button.textContent = label;
    button.addEventListener("click", async () => {
      button.disabled = true;
      try { const response = await fetch(new URL(`/v1/comments/${encodeURIComponent(comment.id)}/${action}`, apiUrl), { method: "POST", credentials: "include" }); if (!response.ok) throw new Error(); onChange(); }
      catch { button.disabled = false; }
    }); actions.append(button, " ");
  }
  item.append(heading, body, actions); return item;
}

export function mountComments(surface: CommentSurface): void {
  const { apiUrl, articleId, featuredIds = "" } = surface.dataset;
  if (!apiUrl || !articleId) return;
  const list = surface.querySelector<HTMLUListElement>("[data-comments-list]"); const more = surface.querySelector<HTMLButtonElement>("[data-comments-more]");
  if (!list || !more) return;
  const excluded = featuredIds.split(",").filter(Boolean); let cursor: string | null = null; let loading = false;
  const load = async (reset = false) => {
    if (loading) return; loading = true;
    try {
      const url = new URL("/v1/comments", apiUrl); url.searchParams.set("articleId", articleId); url.searchParams.set("limit", "20");
      if (excluded.length) url.searchParams.set("excludeIds", excluded.join(",")); if (!reset && cursor) url.searchParams.set("cursor", cursor);
      const response = await fetch(url, { credentials: "include" }); if (!response.ok) throw new Error(); const payload = await response.json() as CommentsListResponse;
      if (reset) list.replaceChildren(); payload.items.forEach((comment) => list.append(commentElement(comment, apiUrl, () => { void load(true); })));
      cursor = payload.nextCursor; more.hidden = !cursor;
    } catch { more.hidden = true; } finally { loading = false; }
  };
  more.addEventListener("click", () => { void load(); }); void load(true);
  surface.closest("article")?.addEventListener("comment:created", () => { void load(true); });
}
