/* Speculative Design Hero — one-file, no dependencies
   (c) Q/EST — drop-in for Jekyll/GitHub Pages
   How to customize: set window.SD_HERO_CONFIG before this script is loaded.
*/
(() => {
  'use strict';

  // -------- Config (override by defining window.SD_HERO_CONFIG) --------
  const defaults = {
    // Mount target. If this ID is not found, it will prepend into <main> (or <body>).
    mountId: 'sd-hero-mount',
    heading: '',
    subLevels: ['Social', '(Information) Technical'],
    meta: 'Dream Future World / Prototype Quantum Computer–Internet Systems',
    taglineJp: 'Design the society of the coming IT paradigm realized by the Quantum Internet.',
    showSubline: false,
    showStack: false,
    layers: 3,               // number of stacked layers
    layerOffsetRem: [0, 0.12, 0.24], // X offsets in rem for each layer index
    layerOffsetYRem: [0, 0.18, 0.36],// Y offsets in rem for each layer index
    colors: ['#000', '#000', '#000'],
    opacities: [1.0, 0.35, 0.25],
    fontStack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    enableParallax: true     // set false to disable mouse parallax
  };
  const CFG = Object.assign({}, defaults, (window.SD_HERO_CONFIG || {}));

  // -------- Style injection --------
  function ensureStyle() {
    if (document.getElementById('sd-hero-style')) return;
    const css = `
:root { --sd-gap: clamp(1.25rem, 5vw, 2rem); }
.sd-container { max-width: min(1080px, 92vw); padding-left: clamp(12px, 3vw, 24px); padding-right: clamp(12px, 3vw, 24px); margin-inline:auto; width:100%; box-sizing:border-box; }
#${CSS.escape(CFG.mountId)} { margin: 0; }
.sd-hero, .sd-hero * { font-family: ${CFG.fontStack}; }
.sd-hero { position: relative; display: block; margin: calc(var(--sd-gap)*1.2) 0; line-height: 1; text-rendering:optimizeLegibility; -webkit-font-smoothing:antialiased; text-align:center; }
.sd-hero .sd-container{display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
.sd-hero__stack{margin-top:.4rem}
.sd-hero__tag{margin-top:.6rem}
.sd-hero__stack { position: relative; display: inline-block; line-height: 1; filter: saturate(110%); max-width:min(28ch,92vw); width:100%; }
.sd-hero__stack::before {
  content: attr(data-text); font-weight: 900;
  font-size: clamp(2rem, 8vw, 5.5rem);
  letter-spacing: .04em; visibility: hidden; white-space: nowrap;
}
.sd-hero__stack span[data-level]{
  position: absolute; left: 0; top: 0; font-weight: 900;
  font-size: clamp(2rem, 8vw, 5.5rem);
  letter-spacing: .04em; white-space: nowrap;
  mix-blend-mode: multiply; will-change: transform;
}
.sd-hero__sub{
  position: relative; margin-top: clamp(2rem, 7vw, 3rem); font-weight: 600; letter-spacing: .02em; text-transform: none; font-size: clamp(1rem, 2.6vw, 1.25rem); color: #000; opacity: .95; z-index: 2;
}
.sd-hero__meta{ font-weight: 500; letter-spacing: .16em; opacity: .7; }
.sd-hero__tag{ position: relative; font-weight:800; letter-spacing:.005em; word-spacing:.03em; color:#000; font-size: clamp(2rem, 5.6vw, 3.2rem); line-height:1.15; opacity:.98; max-width:min(28ch,92vw); margin-left:auto; margin-right:auto; text-align:center; }
.sd-hero__sr{ position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (prefers-color-scheme: dark){
  .sd-hero__stack span[data-level="1"]{ color: #000; }
  .sd-hero__sub{ color: #000; }
  .sd-hero__tag{ color:#000; }
}
@media (prefers-reduced-motion: reduce){
  .sd-hero__stack span[data-level]{ transition: none !important; }
}
    `.trim();
    const style = document.createElement('style');
    style.id = 'sd-hero-style';
    style.textContent = css;
    document.head.appendChild(style);
    // -- styles for Speculative Design Work section
    if (!document.getElementById('sdw-style')) {
      const sdw = document.createElement('style');
      sdw.id = 'sdw-style';
      sdw.textContent = `
.sdw{margin:3rem 0 2.5rem}
.sdw .lead{font-size:1.05rem;opacity:.85;max-width:72ch}
.sdw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-top:1rem}
.sdw-card{border:1px solid rgba(0,0,0,.18); background:transparent; padding:1rem 1.1rem; border-radius:12px}
.sdw-card h3{margin:.2rem 0 .4rem;font-size:1.05rem}
.sdw-card ul{margin:.2rem 0 0 1.2rem}
.sdw-vignettes{margin:.5rem 0 0 1.2rem}
.sdw-vignettes li{margin:.9rem 0}
.sdw-vignettes details{margin:.4rem 0 .2rem}
.sdw-meta{font-size:.9rem;opacity:.75}
.sdw-prompts{margin:.6rem 0 0 1.2rem}
@media (prefers-color-scheme: dark){
  .sdw-card{border-color:rgba(0,0,0,.18); background:transparent}
}`;
      document.head.appendChild(sdw);
    }
    if (!document.getElementById('sdw-axis-style')) {
      const ax = document.createElement('style');
      ax.id = 'sdw-axis-style';
      ax.textContent = `
.sdw-axis-box{margin:1.2rem 0 1.6rem}
.sdw-axis-svg{width:100%;height:84px;display:block}
.sdw-axis-svg .axis-shape{stroke:none;fill:url(#sdw-axis-grad)}
.sdw-axis-svg text{fill:#000;font-weight:700;letter-spacing:.01em;font-size:clamp(18px,2.8vw,32px)}
`;
      document.head.appendChild(ax);
    }
    // Additional creative layout styles
    const creativeStyles = `
    .sdw-weave{position:relative;display:flex;flex-direction:column;row-gap:2.4rem;margin-top:2rem;width:100%;align-items:center;justify-content:center}
    .sdw-weave::before{display:none}
    .sdw-pillar{position:relative;display:flex;flex-direction:column;justify-content:flex-start;min-height:100%;padding-left:1.35rem;border-left:4px solid #000;padding-block:1rem 1.4rem}
    .sdw-pillar::before{content:"";position:absolute;left:-1.35rem;top:-.6rem;width:36px;height:22px;border-top:2px solid #000;border-left:2px solid #000}
    .sdw-pillar::after{content:"";position:absolute;right:-.6rem;bottom:-.6rem;width:36px;height:22px;border-right:2px solid #000;border-bottom:2px solid #000}
    .sdw-pillar>*{position:relative;z-index:1}
    .sdw-bubbles{position:absolute;inset:-10px -10px -10px -10px;z-index:0;pointer-events:none}
    .sdw-bubbles .b{position:absolute;border:2px solid #000;border-radius:999px;opacity:.12}
    .sdw-bubbles .a{width:170px;height:170px;left:-42px;top:-28px;transform:rotate(-6deg)}
    .sdw-bubbles .b{width:108px;height:108px;right:10%;top:6px}
    .sdw-bubbles .c{width:146px;height:146px;right:-34px;bottom:-20px}
    .sdw-bubbles .d{width:78px;height:78px;left:14%;bottom:2px}
    .sdw-num{display:none}
    .sdw-title{margin:.35rem 0 .25rem;font-weight:900;letter-spacing:.005em;font-size:clamp(2rem,5vw,3rem);line-height:1.08;max-width:min(32ch,100%)}
    .sdw-title::after{content:"";display:block;width:78px;height:2px;background:#000;margin:.38rem 0 .6rem}
    .sdw-tags{margin:.25rem 0 .7rem;font-weight:700;letter-spacing:.05em;word-spacing:.22em;line-height:1.4;font-size:clamp(1rem,2.6vw,1.25rem)}
    .sdw-verse{display:flex;flex-wrap:wrap;gap:.55rem .66rem;max-width:min(74ch,92vw)}
    .sdw-verse .word{display:inline-block;border:2px solid #000;border-radius:999px;padding:.24rem .68rem;font-weight:800;letter-spacing:.01em}
    .sdw-pillar .sdw-verse{max-width:min(64ch,100%)}
    /* manifesto band */
    .sdw-manifesto{position:relative;display:flex;align-items:center;justify-content:center;min-height:120px;margin:1.8rem 0 2.2rem}
    .sdw-manifesto::before,.sdw-manifesto::after{display:none}
    .sdw-manifesto::before{top:0}.sdw-manifesto::after{bottom:0}
    .sdw-vlabel{position:absolute;inset-block:0;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;transform:rotate(180deg);font-weight:800;letter-spacing:.18em;font-size:clamp(.8rem,2vw,1rem)}
    .sdw-vlabel.left{left:-1rem}.sdw-vlabel.right{right:-1rem}
    .sdw-vlabel::before,.sdw-vlabel::after{content:"";position:absolute;width:10px;height:10px;border:2px solid #000;border-radius:999px;opacity:.5}
    .sdw-vlabel::before{top:6px}.sdw-vlabel::after{bottom:6px}
    .sdw-strap{text-align:center}
    .sdw-strapline{display:block}
    .sdw-strapline.top{font-weight:900;letter-spacing:.18em;text-transform:uppercase;font-size:clamp(1rem,2.4vw,1.35rem)}
    .sdw-strapline.bottom{margin-top:.35rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:clamp(.9rem,2.2vw,1.1rem);opacity:.98}
    /* stage & overlay for connector */
    .sdw-stage{position:relative}
    .sdw-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
    .sdw-wire{stroke:#000;stroke-width:3;fill:none;stroke-dasharray:12 8;opacity:.95;stroke-linecap:round;vector-effect:non-scaling-stroke;shape-rendering:geometricPrecision}
    .sdw-sep{height:0;background:transparent;margin-top:auto;margin-bottom:1rem}
    @media (max-width:780px){
      .sdw-weave{grid-template-columns:1fr;grid-auto-rows:auto;column-gap:0;row-gap:1.2rem;margin-top:1.2rem}
      .sdw-weave::before{display:none}
      .sdw-vlabel.left{left:-.42rem}.sdw-vlabel.right{right:-.42rem}
      .sdw-num{font-size:3.6rem}
      .sdw-wire{stroke-width:3.5;stroke-dasharray:10 7}
    }
    a{color:#000}
  `;
    if (!document.getElementById('sdw-creative-style')) {
      const cs = document.createElement('style');
      cs.id = 'sdw-creative-style';
      cs.textContent = creativeStyles;
      document.head.appendChild(cs);
    }
  }

  // -------- DOM builders --------
  function buildHero() {
    const root = document.createElement('section');
    root.className = 'sd-hero';
    root.setAttribute('role', 'banner');
    root.setAttribute('aria-label', 'Q/EST Projects');

    const wrap = document.createElement('div');
    wrap.className = 'sd-container';

    // Accessible <h1> (screen-reader only)
    const sr = document.createElement('h1');
    sr.className = 'sd-hero__sr';
    sr.textContent = CFG.heading;
    wrap.appendChild(sr);

    if (CFG.taglineJp) {
      const tag = document.createElement('p');
      tag.className = 'sd-hero__tag';
      tag.textContent = CFG.taglineJp;
      wrap.appendChild(tag);
    }

    // Visual stack (only when heading exists and showStack is true)
    if (CFG.showStack && CFG.heading) {
      const stack = document.createElement('div');
      stack.className = 'sd-hero__stack';
      stack.setAttribute('data-text', CFG.heading);
      const total = Math.max(1, CFG.layers | 0);
      for (let i = 0; i < total; i++) {
        const span = document.createElement('span');
        span.setAttribute('data-level', String(i + 1));
        span.setAttribute('aria-hidden', 'true');
        span.textContent = CFG.heading.replace(/ /g, '\u00A0');
        span.style.color = CFG.colors[i % CFG.colors.length];
        span.style.opacity = (CFG.opacities[i] == null ? 1 : CFG.opacities[i]);
        const ox = (CFG.layerOffsetRem[i] ?? (0.12 * i));
        const oy = (CFG.layerOffsetYRem[i] ?? (0.18 * i));
        span.style.transform = `translate(${ox}rem, ${oy}rem)`;
        stack.appendChild(span);
      }
      wrap.appendChild(stack);
    }

    if (CFG.showSubline) {
      // Sub line
      const sub = document.createElement('p');
      sub.className = 'sd-hero__sub';
      const levels = document.createElement('span');
      levels.className = 'sd-hero__levels';
      levels.textContent = (CFG.subLevels && CFG.subLevels.length)
        ? CFG.subLevels.join(' \u2192 ')
        : '';
      sub.appendChild(levels);
      if (CFG.meta) {
        sub.appendChild(document.createTextNode(' '));
        const meta = document.createElement('span');
        meta.className = 'sd-hero__meta';
        meta.textContent = '\u2014 ' + CFG.meta;
        sub.appendChild(meta);
      }
      wrap.appendChild(sub);
    }

    root.appendChild(wrap);
    return root;
  }

  // -------- Speculative Design Work (derived from PDF) --------
  function buildDesignWork() {
    const section = document.createElement('section');
    section.className = 'sdw';
    section.setAttribute('aria-label', 'Q/est Subprojects');
    section.innerHTML = `
        <div class="sd-container sdw-stage">
          <div class="sdw-weave">
            <div class="sdw-pillar">
                <div class="sdw-bubbles"><span class="b a"></span><span class="b b"></span><span class="b c"></span><span class="b d"></span></div>
              <span class="sdw-num">1</span>
              <h3 class="sdw-title">Dream Future World with Quantum</h3>
              <div class="sdw-verse">
                <span class="word">#FutureDesignWithQuantum</span>
                <span class="word">#200YearLifespan</span>
                <span class="word">#LogisticsRevolution</span>
                <span class="word">#UnbreakableSecurity</span>
                <span class="word">#ConsensusComputation</span>
                <span class="word">#UltraFineSensing</span>
                <span class="word">#EarlyWarning</span>
                <span class="word">#QuantumLiteracy</span>
              </div>
              <div class="sdw-sep"></div>
            </div>
            <div class="sdw-pillar">
                <div class="sdw-bubbles"><span class="b a"></span><span class="b b"></span><span class="b c"></span><span class="b d"></span></div>
              <span class="sdw-num">2</span>
              <h3 class="sdw-title">Prototype Quantum Computer/Internet Systems</h3>
              <div class="sdw-verse">
                <span class="word">#QKD</span>
                <span class="word">#DistributedQC</span>
                <span class="word">#QuantumSensorNetworks</span>
                <span class="word">#ClockSync</span>
                <span class="word">#QuantumTeleportation</span>
                <span class="word">#QuantumSwitch</span>
                <span class="word">#QuantumRouter</span>
                <span class="word">#DeviceDrivers</span>
                <span class="word">#QMPI</span>
              </div>
              <div class="sdw-sep"></div>
            </div>
          </div>
        </div>
      `;
    return section;
  }

  // -------- Mount logic --------
  function mountHero(hero) {
    let mount = document.getElementById(CFG.mountId);
    if (!mount) {
      const main = document.querySelector('main, .page-content, .site-main, #main');
      mount = document.createElement('div');
      mount.id = CFG.mountId;
      (main || document.body).prepend(mount);
    }
    mount.innerHTML = '';
    mount.appendChild(hero);
  }

  // -------- Tiny parallax (optional) --------
  function addParallax(hero) {
    if (!CFG.enableParallax || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stack = hero.querySelector('.sd-hero__stack');
    if (!stack) return;
    const spans = stack.querySelectorAll('span[data-level]');
    let raf = 0;
    const base = [...spans].map((s, i) => ({
      ox: parseFloat(CFG.layerOffsetRem[i] ?? (0.12 * i)),
      oy: parseFloat(CFG.layerOffsetYRem[i] ?? (0.18 * i))
    }));

    const onMove = (e) => {
      const r = stack.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) - 0.5;
      const y = ((e.clientY - r.top) / r.height) - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        spans.forEach((s, i) => {
          const tx = (i + 1) * x * 6;  // px
          const ty = (i + 1) * y * 9;  // px
          s.style.transform = `translate(${base[i].ox}rem, ${base[i].oy}rem) translate(${tx}px, ${ty}px)`;
        });
      });
    };
    const reset = () => spans.forEach((s, i) => {
      s.style.transform = `translate(${base[i].ox}rem, ${base[i].oy}rem)`;
    });

    stack.addEventListener('mousemove', onMove);
    stack.addEventListener('mouseleave', reset);
  }

  // -------- Connector wire (Social -> Prototype Systems title) --------
  function drawWire(section){
    try{
      const stage = section.querySelector('.sdw-stage');
      if(!stage) return;
      const svg = stage.querySelector('.sdw-overlay');
      const left = stage.querySelector('.sdw-vlabel.left');
      const right = stage.querySelector('.sdw-vlabel.right');
      const manifesto = stage.querySelector('.sdw-manifesto');
      if(!svg || !left || !right || !manifesto) return;
      const R = stage.getBoundingClientRect();
      const rL = left.getBoundingClientRect();
      const rR = right.getBoundingClientRect();
      const rM = manifesto.getBoundingClientRect();
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      const y = ((rM.top + rM.bottom)/2) - R.top;
      const gap = 18; // add breathing room near the vertical labels
      const x1 = (rL.right - R.left) + gap;
      const x2 = (rR.left - R.left) - gap;

      let path = svg.querySelector('path.sdw-wire');
      if(!path){
        path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('class','sdw-wire');
        svg.appendChild(path);
      }
      // ensure no arrowheads are present
      path.removeAttribute('marker-start');
      path.removeAttribute('marker-end');
      path.setAttribute('d', `M ${x1},${y} L ${x2},${y}`);
    }catch(e){/* no-op */}
  }

  // -------- Init --------
  function init() {
    ensureStyle();
    const hero = buildHero();
    mountHero(hero);
    // Append the Speculative Design Work section after the hero mount
    try {
      const mount = document.getElementById(CFG.mountId);
      if (mount) {
        const work = buildDesignWork();
        mount.appendChild(work);
        // no connector wire (horizontal dashed line) is drawn
      }
    } catch (e) { /* no-op */ }
    addParallax(hero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();