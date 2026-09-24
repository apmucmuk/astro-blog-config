async function request(url, init) {
  const response = await fetch(url, { credentials: "include", ...init });
  if (!response.ok) throw new Error("Admin request failed");
  return response;
}

function mountModeration(root) {
  const status = root.querySelector("[data-admin-status]");
  const list = root.querySelector("[data-admin-list]");
  const message = root.querySelector("[data-admin-message]");
  const purge = root.querySelector("[data-admin-purge]");
  const render = async () => {
    message.textContent = "";
    try {
      const response = await request(`/admin/api/comments?status=${encodeURIComponent(status.value)}`);
      const queue = await response.json();
      list.replaceChildren(...queue.items.map((comment) => {
        const item = document.createElement("li");
        item.innerHTML = `<p><strong></strong> <small></small></p><p></p><label data-link-label>Link rel <select data-link-rel><option value="nofollow">nofollow</option><option value="sponsored">sponsored</option><option value="dofollow">dofollow</option></select></label><p><button type="button" data-action="published">Opublikuj</button> <button type="button" data-action="pending">Oczekuje</button> <button type="button" data-action="spam">Spam</button> <button type="button" data-action="delete">Usuń</button></p>`;
        item.querySelector("strong").textContent = comment.name;
        item.querySelector("small").textContent = `${comment.articleId} · ${comment.status} · zgłoszenia: ${comment.reportsCount}`;
        item.querySelectorAll("p")[1].textContent = comment.body;
        const links = [...comment.body.matchAll(/https?:\/\/[^\s<>"']+/gi)].length;
        const linkLabel = item.querySelector("[data-link-label]");
        const linkRel = item.querySelector("[data-link-rel]");
        linkLabel.hidden = links !== 1;
        if (comment.linkRel) linkRel.value = comment.linkRel;
        item.querySelectorAll("button").forEach((button) => button.addEventListener("click", async () => {
          try {
            const action = button.dataset.action;
            if (action === "delete") await request(`/admin/api/comments/${comment.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
            else await request(`/admin/api/comments/${comment.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action, ...(action === "published" && links === 1 ? { linkRel: linkRel.value } : {}) }) });
            await render();
          } catch { message.textContent = "Nie udało się zapisać moderacji."; }
        }));
        return item;
      }));
      if (!queue.items.length) list.textContent = "Brak komentarzy w tej kolejce.";
    } catch { message.textContent = "Nie udało się pobrać kolejki moderacji."; }
  };
  status.addEventListener("change", () => { void render(); });
  purge.addEventListener("click", async () => {
    try { await request("/admin/api/comments/spam/purge", { method: "POST", headers: { "Content-Type": "application/json" } }); await render(); }
    catch { message.textContent = "Nie udało się usunąć spamu."; }
  });
  void render();
}

document.querySelectorAll("[data-admin]").forEach(mountModeration);
