// This string is emitted verbatim into every static HTML document. Its exact
// bytes are SHA-256-hashed into the generated production CSP.
export const themeBootstrap = `(()=>{const k="tragarze-theme-preference",r=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");let p="system";try{const v=localStorage.getItem(k);if(v==="light"||v==="dark"||v==="system")p=v}catch{}const t=p==="system"?(m.matches?"dark":"light"):p;r.dataset.theme=t;r.dataset.themePreference=p;r.style.colorScheme=t})();`;
