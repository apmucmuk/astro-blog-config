(() => {
  const key = "tragarze-theme-preference";
  const valid = new Set(["system", "light", "dark"]);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const root = document.documentElement;
  const read = () => { try { const value = window.localStorage.getItem(key); return valid.has(value) ? value : "system"; } catch { return "system"; } };
  let preference = valid.has(root.dataset.themePreference) ? root.dataset.themePreference : read();
  const effective = () => preference === "system" ? (media.matches ? "dark" : "light") : preference;
  const apply = () => { const value = effective(); root.dataset.theme = value; root.dataset.themePreference = preference; root.style.colorScheme = value; return value; };
  const persist = () => { try { window.localStorage.setItem(key, preference); } catch { /* storage is optional */ } };
  const updateControls = () => {
    const value = effective(); const next = value === "dark" ? "jasny" : "ciemny";
    const toggle = document.querySelector("[data-theme-toggle]"); const icon = document.querySelector("[data-theme-icon]"); const label = document.querySelector("[data-theme-toggle-label]"); const system = document.querySelector("[data-theme-system]");
    if (toggle) { toggle.setAttribute("aria-label", `Włącz motyw ${next}`); toggle.setAttribute("title", `Włącz motyw ${next}`); }
    if (icon) icon.textContent = value === "dark" ? "☀" : "☾";
    if (label) label.textContent = `Włącz motyw ${next}`;
    if (system) system.setAttribute("aria-pressed", String(preference === "system"));
  };
  const initializeControls = () => {
    updateControls();
    document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => { preference = effective() === "dark" ? "light" : "dark"; persist(); apply(); updateControls(); });
    document.querySelector("[data-theme-system]")?.addEventListener("click", () => { preference = "system"; persist(); apply(); updateControls(); });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeControls, { once: true });
  else initializeControls();
  media.addEventListener("change", () => { if (preference === "system") { apply(); updateControls(); } });
})();
