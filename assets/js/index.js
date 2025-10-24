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
  const MAX_CLOUD_WORDS = 28;

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
      .sd-line{max-width:1200px;margin-left:auto;margin-right:auto;font-size:clamp(1.6rem, 3vw, 2.6rem);line-height:1.55;letter-spacing:.25px;opacity:0;transform:translateY(6px);transition:opacity .8s ease, transform .8s ease;padding:0 1.2rem}
      .sd-line.show{opacity:1;transform:translateY(0)}
      .sd-line + .sd-line{margin-top:.35rem;font-size:clamp(1.35rem,2.5vw,2.2rem)}
      .sd-badges{margin-top:.5rem;display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;opacity:.9;transform:scale(1.1)}
      .sd-label{margin-top:.6rem;display:block;font-size:1rem;opacity:.9;letter-spacing:.2px;text-decoration:underline;text-underline-offset:3px}
      .sd-badge{display:inline-block;border-radius:999px;padding:.18rem .6rem;border:1px solid color-mix(in oklab, CanvasText 30%, transparent);font-size:.82rem;white-space:nowrap;background:color-mix(in oklab, Canvas 92%, CanvasText 8%)}
      .sd-cloud{position:absolute;inset:-10%;overflow:visible;z-index:-1}
      .sd-cloud span{position:absolute;font-size:clamp(1rem,1.5vw,1.25rem);opacity:.3;color:color-mix(in oklab, CanvasText 75%, transparent);user-select:none;filter:blur(.3px);white-space:nowrap;}
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
        <div class="sd-line" id="sd-line-system"></div>
        <div class="sd-label" id="sd-label" aria-hidden="true">related areas</div>
        <div class="sd-badges" id="sd-badges"></div>
        <div class="sd-cloud" id="sd-cloud" aria-hidden="true"></div>
      </div>
    `;

    const lineEl = $("#sd-line", root);
    const badgesEl = $("#sd-badges", root);
    const cloudEl = $("#sd-cloud", root);
    const labelEl = $("#sd-label", root);
    const sysEl = $("#sd-line-system", root);
    const DEFAULT_QUESTION = "How will the development of quantum technologies reshape human behavior, everyday life, and society through changes in individual and collective actions?";
    const DEFAULT_SYSTEM_QUESTION = "What system‑level milestones and architectures are needed to achieve reliable connections between quantum computers and scalable, secure quantum networks?";
    const providedQuestion = (root.dataset.question || "").trim();
    const providedSystemQuestion = (root.dataset.systemQuestion || "").trim();
    const FIXED_QUESTION = (providedQuestion || DEFAULT_QUESTION);
    const FIXED_SYSTEM_QUESTION = (providedSystemQuestion || DEFAULT_SYSTEM_QUESTION);
    // Always fixed: disable random question generation entirely
    const useFixedQuestion = true;
    if (labelEl) labelEl.textContent = "related areas";

    // Alternate between two fixed questions (main/system)
    let qIndex = 0;
    function showQuestion(index) {
      const isMain = (index % 2 === 0);
      // fade out both
      lineEl.classList.remove("show");
      if (sysEl) sysEl.classList.remove("show");
      setTimeout(() => {
        // badges: random each cycle unless data-* fixed values are provided
        const p = hasFixedBadges
          ? {
              layer: fixedLayer || "Sensing",
              tech:  fixedTech  || "Gyroscope",
              mid:   fixedMid   || "Behavior change",
              final: fixedFinal || "Societal impact"
            }
          : buildPromptObj();
        badgesEl.innerHTML = `
          <span class="sd-badge">${p.layer}</span>
          <span class="sd-badge">${p.tech}</span>
          <span class="sd-badge">${p.mid}</span>
          <span class="sd-badge">${p.final}</span>
        `;
        if (isMain) {
          // show main question, hide system
          lineEl.textContent = FIXED_QUESTION;
          lineEl.style.display = "";
          if (sysEl) sysEl.style.display = "none";
          void lineEl.offsetWidth; // reflow
          lineEl.classList.add("show");
        } else {
          // show system question, hide main
          if (sysEl) {
            sysEl.textContent = FIXED_SYSTEM_QUESTION;
            sysEl.style.display = "";
            lineEl.style.display = "none";
            void sysEl.offsetWidth; // reflow
            sysEl.classList.add("show");
          } else {
            // fallback: render on main line if system element is absent
            lineEl.textContent = FIXED_SYSTEM_QUESTION;
            lineEl.style.display = "";
            void lineEl.offsetWidth;
            lineEl.classList.add("show");
          }
        }
      }, 90);
    }

    const fixedLayer = (root.dataset.layer || "").trim();
    const fixedTech  = (root.dataset.tech  || "").trim();
    const fixedMid   = (root.dataset.mid   || "").trim();
    const fixedFinal = (root.dataset.final || "").trim();
    const hasFixedBadges = !!(fixedLayer || fixedTech || fixedMid || fixedFinal);

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
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 50) {
        const x = 50 + (Math.random() - 0.5) * 120; // allow spill outside (−10% to 110%)
        const y = 50 + (Math.random() - 0.5) * 100; // allow vertical overflow
        span.style.left = x + "%";
        span.style.top = y + "%";
        placed = true;
        // simple overlap check
        for (const other of cloudEl.children) {
          if (other === span) continue;
          const dx = parseFloat(other.style.left) - x;
          const dy = parseFloat(other.style.top) - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 8) { placed = false; break; } // 8% apart minimum
        }
        attempts++;
      }
      cloudEl.appendChild(span);
    }

    const firstPrompt = useFixedQuestion
      ? {
          layer: fixedLayer || "Sensing",
          tech:  fixedTech  || "Gyroscope",
          mid:   fixedMid   || "Behavior change",
          final: fixedFinal || "Societal impact"
        }
      : buildPromptObj();

    function renderOnce() {
      showQuestion(qIndex);
      qIndex = (qIndex + 1) % 2;
    }

    // first render
    renderOnce();

    // Alternate between two fixed questions (respect prefers-reduced-motion)
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