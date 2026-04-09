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
#${CSS.escape(CFG.mountId)} { margin: 0 auto; width: 100%; display: flex; justify-content: center; }
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
@media (max-width: 900px){
  #${CSS.escape(CFG.mountId)}{
    flex-direction: column;
    align-items: center;
    gap: clamp(1.25rem, 5vw, 2rem);
  }
  .sd-hero{
    width: 100%;
    margin: 1rem 0 0;
  }
  .sd-hero__tag{
    max-width: min(18ch, 100%);
    font-size: clamp(1.6rem, 8vw, 2.55rem);
    line-height: 1.18;
  }
}
@media (max-width: 640px){
  .sd-container{
    max-width: min(100%, 94vw);
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .sd-hero__tag{
    max-width: 12ch;
    font-size: clamp(1.25rem, 7.2vw, 2rem);
    line-height: 1.2;
    letter-spacing: 0;
  }
}
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
    // Project category styles
    const creativeStyles = `
    .sdw{width:100%; margin:2rem 0 1.25rem}
    .sdw-stage{width:100%}
    .sdw-header{display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:clamp(1.6rem,3vw,2.4rem)}
    .sdw-header::before{content:"";display:block;width:10px;height:clamp(2.2rem,5vw,3.9rem);background:#21b3f3;border-radius:999px}
    .sdw-heading{margin:0;max-width:12ch;font-size:clamp(2rem,5vw,4.2rem);line-height:1.06;font-weight:900;letter-spacing:-.03em;text-align:center}
    .sdw-axis-box{display:none}
    .sdw-grid-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1.5rem,7vw,8rem);align-items:start;justify-items:center}
    .sdw-block{display:flex;gap:clamp(1rem,2vw,1.6rem);align-items:flex-start}
    .sdw-num{flex:0 0 auto;font-weight:900;font-size:clamp(2.4rem,4.6vw,4rem);line-height:1;color:#202020}
    .sdw-copy{max-width:18ch;text-align:center}
    .sdw-title{margin:0;font-weight:900;font-size:clamp(2.2rem,4.8vw,4rem);line-height:1.12;letter-spacing:-.03em;color:#1f1f1f;text-align:center}
    .sdw-block--right{justify-self:end}
    .sdw-block--right .sdw-copy{max-width:17ch}
    @media (max-width:900px){
      .sdw-grid-two{grid-template-columns:1fr;gap:1.8rem}
      .sdw-block--right{justify-self:center}
      .sdw-block,
      .sdw-block--right{justify-content:center;width:min(100%,22rem)}
      .sdw-copy,
      .sdw-block--right .sdw-copy{max-width:22ch}
      .sdw-heading{font-size:clamp(1.8rem,8vw,3rem)}
    }
    @media (max-width:640px){
      .sdw{margin:1.25rem 0 1rem}
      .sdw-header{flex-direction:column;gap:.9rem}
      .sdw-header,
      .sdw-block{justify-content:center}
      .sdw-header{margin-bottom:1rem}
      .sdw-header::before{width:56px;height:8px}
      .sdw-block{flex-direction:column;align-items:center;gap:.55rem}
      .sdw-num{font-size:clamp(2rem,10vw,3rem)}
      .sdw-copy,
      .sdw-block--right .sdw-copy{max-width:11ch}
      .sdw-title{font-size:clamp(1.7rem,8vw,2.4rem)}
      .sdw-axis-box{margin-bottom:1.8rem}
    }
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
    section.setAttribute('aria-label', 'Q/est Projects');
    section.innerHTML = `
        <div class="sd-container sdw-stage">
          <div class="sdw-header">
            <h2 class="sdw-heading">Q/est Project Categories</h2>
          </div>
          <div class="sdw-grid-two">
            <div class="sdw-block">
              <div class="sdw-num">1.</div>
              <div class="sdw-copy">
                <h3 class="sdw-title">Dream Future World with Quantum</h3>
              </div>
            </div>
            <div class="sdw-block sdw-block--right">
              <div class="sdw-num">2.</div>
              <div class="sdw-copy">
                <h3 class="sdw-title">Prototype Quantum Computer/Internet Systems</h3>
              </div>
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
