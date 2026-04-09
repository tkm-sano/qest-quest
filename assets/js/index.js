/* Q/est "Speculative Design" Ambient
   Purpose: lightweight supporting line below the main hero.
*/
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  function injectStyles() {
    if (document.getElementById("sd-style")) return;
    const css = `
      .sd-wrap{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif}
      .sd-ambient{position:relative;display:block;text-align:center;pointer-events:none}
      .sd-ambient.sd-block{min-height:18vh;margin:1.5rem 0}
      .sd-ambient.sd-compact{min-height:auto;margin:.25rem 0 .6rem}
      .sd-ambient.sd-overlay{position:absolute;inset:0;min-height:0;margin:0}
      #sd-root.sd-overlay-host{position:relative;}
      .sd-line{max-width:880px;margin-left:auto;margin-right:auto;font-size:clamp(1rem, 1.9vw, 1.3rem);line-height:1.7;letter-spacing:.01em;opacity:0;transform:translateY(4px);transition:opacity .45s ease, transform .45s ease;padding:0 1rem;color:color-mix(in oklab, CanvasText 82%, transparent)}
      .sd-line.show{opacity:1;transform:translateY(0)}
      @media (prefers-reduced-motion: reduce) {
        .sd-line{transition:none}
      }
    `;
    const s = document.createElement("style");
    s.id = "sd-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function setup(root) {
    injectStyles();
    root.classList.add("sd-wrap");
    root.innerHTML = `
      <div class="sd-ambient" aria-live="off">
        <div class="sd-line" id="sd-line"></div>
      </div>
    `;

    const lineEl = $("#sd-line", root);
    const DEFAULT_QUESTION = "Exploring how quantum technologies may reshape everyday life and society.";
    const providedQuestion = (root.dataset.question || "").trim();
    const FIXED_QUESTION = (providedQuestion || DEFAULT_QUESTION);

    const mode = (root.dataset.mode || "compact").toLowerCase();
    const ambient = root.querySelector(".sd-ambient");
    ambient.classList.add(`sd-${mode}`);
    if (mode === "overlay") root.classList.add("sd-overlay-host");
    lineEl.textContent = FIXED_QUESTION;
    requestAnimationFrame(() => lineEl.classList.add("show"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const host = document.getElementById("sd-root");
    if (host) setup(host);
  });
})();
