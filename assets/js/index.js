/* Q/est "Speculative Design" Ambient
   Purpose: purely presentational mood layer (no user interaction).
   Modes:
     - data-mode="compact" (default): small band with minimal height/margins
     - data-mode="block": larger band (hero-like) with 42vh
     - data-mode="overlay": absolute overlay (no layout push); host gets position:relative
   Behavior:
     - Auto-rotates a single "What if..." line every ROTATE_MS.
     - Shows small badges that update with the line.
     - Renders a faint floating word cloud in the background.
   Accessibility:
     - Not focusable; pointer-events disabled.
     - Respects prefers-reduced-motion (no animations/rotation).
*/
(function () {
  const ROTATE_MS = 6000; // change here if you want slower/faster rotation
  const MAX_CLOUD_WORDS = 14;

  const $ = (sel, root = document) => root.querySelector(sel);

  function injectStyles() {
    if (document.getElementById("sd-style")) return;
    const css = `
      .sd-wrap{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif}
      .sd-ambient{position:relative;display:block;text-align:center;pointer-events:none}
      .sd-ambient.sd-block{min-height:42vh;margin:2rem 0}
      .sd-ambient.sd-compact{min-height:16vh;margin:.75rem 0}
      .sd-ambient.sd-overlay{position:absolute;inset:0;min-height:0;margin:0}
      #sd-root.sd-overlay-host{position:relative;}
      .sd-line{max-width:1100px;margin-left:auto;margin-right:auto;font-size:clamp(1.2rem, 2.2vw, 2rem);line-height:1.45;letter-spacing:.2px;opacity:0;transform:translateY(6px);transition:opacity .8s ease, transform .8s ease;padding:0 1rem}
      .sd-line.show{opacity:1;transform:translateY(0)}
      .sd-badges{margin-top:.6rem;display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center;opacity:.85}
      .sd-badge{display:inline-block;border-radius:999px;padding:.18rem .6rem;border:1px solid color-mix(in oklab, CanvasText 30%, transparent);font-size:.82rem;white-space:nowrap;background:color-mix(in oklab, Canvas 92%, CanvasText 8%)}
      .sd-cloud{position:absolute;inset:0;overflow:hidden;z-index:-1}
      .sd-cloud span{position:absolute;font-size:clamp(.7rem,1.1vw,.95rem);opacity:.18;user-select:none;filter:blur(.2px)}
      @keyframes sdFloat { from { transform:translateY(0px) } to { transform:translateY(-20px) } }
      .sd-cloud span.a{animation:sdFloat 14s ease-in-out infinite alternate}
      .sd-cloud span.b{animation:sdFloat 18s ease-in-out infinite alternate}
      .sd-cloud span.c{animation:sdFloat 22s ease-in-out infinite alternate}
      @media (prefers-color-scheme: dark) {
        .sd-badge{border-color:#333;background:#111;color:#eaeaea}
      }
      @media (prefers-reduced-motion: reduce) {
        .sd-line{transition:none}
        .sd-cloud span{animation:none}
      }
    `;
    const s = document.createElement("style");
    s.id = "sd-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // Vocabulary (edit freely)
  const data = {
    layers: ["Computing", "Networking", "Sensing"],
    tech: {
      Computing: ["Molecular computation", "Linear search", "Optimization problems"],
      Networking: [
        "Quantum key distribution",
        "Time synchronization",
        "Entanglement distribution",
        "Quantum sensor network"
      ],
      Sensing: ["Magnetometer", "Gravimeter", "Accelerometer", "Gyroscope", "Imaging", "Atomic clock"]
    },
    midDomains: [
      "Materials discovery",
      "Drug discovery",
      "Anomaly detection",
      "Logistics",
      "Financial strategy",
      "Energy",
      "Planning",
      "Cybersecurity",
      "Cloud",
      "Navigation",
      "Earth observation",
      "Infrastructure management",
      "Healthcare"
    ],
    finalDomains: [
      "Clothing",
      "Building materials",
      "Robots",
      "Mobility component technologies",
      "Rocket components",
      "Medical treatment",
      "Pets",
      "Livestock",
      "Agriculture",
      "Money laundering detection",
      "Delivery route optimization",
      "Portfolio optimization",
      "Power demand response",
      "Traffic flow prediction",
      "Autonomous driving",
      "Seismic activity prediction",
      "Medical diagnostics",
      "ATM/UTM high‑precision timing",
      "GPS‑independent navigation",
      "Volcano & earthquake prediction",
      "Road infrastructure anomaly detection"
    ],
    audiences: [
      "citizens",
      "commuters",
      "care teams",
      "port authorities",
      "air‑traffic managers",
      "logistics planners",
      "city gardeners",
      "elderly residents",
      "factory operators",
      "first responders",
      "pets & livestock keepers"
    ],
    places: [
      "a megacity in 2040",
      "remote islands",
      "smart highways",
      "urban underground spaces",
      "stratospheric platforms",
      "coastal logistics hubs",
      "satellite constellations"
    ]
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const flatten = (obj) => Object.values(obj).flat();

  function buildPromptObj() {
    const layer = pick(data.layers);
    return {
      layer,
      tech: pick(data.tech[layer]),
      mid: pick(data.midDomains),
      final: pick(data.finalDomains),
      audience: pick(data.audiences),
      place: pick(data.places)
    };
  }

  function promptText(p) {
    return `What if ${p.tech.toLowerCase()} (${p.layer}) reshaped ${p.mid.toLowerCase()} for ${p.audience} in ${p.place} — enabling ${p.final.toLowerCase()}?`;
  }

  function setup(root) {
    injectStyles();
    root.classList.add("sd-wrap");
    root.innerHTML = `
      <div class="sd-ambient" aria-live="off">
        <div class="sd-line" id="sd-line"></div>
        <div class="sd-badges" id="sd-badges"></div>
        <div class="sd-cloud" id="sd-cloud" aria-hidden="true"></div>
      </div>
    `;

    const lineEl = $("#sd-line", root);
    const badgesEl = $("#sd-badges", root);
    const cloudEl = $("#sd-cloud", root);
    const mode = (root.dataset.mode || "compact").toLowerCase();
    const ambient = root.querySelector(".sd-ambient");
    ambient.classList.add(`sd-${mode}`);
    if (mode === "overlay") root.classList.add("sd-overlay-host");

    // build background cloud
    const words = [
      ...data.layers,
      ...flatten(data.tech),
      ...data.midDomains,
      ...data.finalDomains,
      ...data.audiences,
      ...data.places
    ];
    for (let i = 0; i < Math.min(MAX_CLOUD_WORDS, words.length); i++) {
      const span = document.createElement("span");
      span.textContent = pick(words);
      span.style.top = Math.round(Math.random() * 90) + "%";
      span.style.left = Math.round(Math.random() * 90) + "%";
      span.className = ["a","b","c"][Math.floor(Math.random()*3)];
      cloudEl.appendChild(span);
    }

    function renderOnce() {
      const p = buildPromptObj();
      // fade out
      lineEl.classList.remove("show");
      // update text after a small delay to sync with CSS
      setTimeout(() => {
        lineEl.textContent = promptText(p);
        badgesEl.innerHTML = `
          <span class="sd-badge">${p.layer}</span>
          <span class="sd-badge">${p.tech}</span>
          <span class="sd-badge">${p.mid}</span>
          <span class="sd-badge">${p.final}</span>
        `;
        // force reflow then fade in
        void lineEl.offsetWidth;
        lineEl.classList.add("show");
      }, 90);
    }

    // first render
    renderOnce();

    // respects prefers-reduced-motion: stop rotation
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) {
      setInterval(renderOnce, ROTATE_MS);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const host = document.getElementById("sd-root");
    if (host) setup(host);
  });
})();