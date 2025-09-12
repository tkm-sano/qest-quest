---
title: Vision
lang: en
permalink: /en/
layout: default
nav_order: 1     # ナビの並び順。お好みで
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter I :: VISION ::">
    <em>:: VISION ::</em>
  </h1>
  {% if page.lang == "en" %}
    <p class="lead">Designing and realizing the near-future IT paradigm with Quantum Internet</p>
  {% else %}
    <p class="lead">量子インターネットによる近未来ITパラダイムの社会デザインと実現</p>
  {% endif %}
</section>
<section class="quantum-demo" data-reveal>
  <div id="quantum-visualization" class="complex-viz"></div>
  <script>
    (function(){
      const container = document.getElementById('quantum-visualization');
      container.innerHTML = '';
      const svgNS = 'http://www.w3.org/2000/svg';
      const w = 800, h = 500;
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      container.appendChild(svg);

      // Section titles inside SVG
      const styleTitle = (text, y) => {
        const lbl = document.createElementNS(svgNS,'text');
        lbl.setAttribute('x', w/2);
        lbl.setAttribute('y', y);
        lbl.setAttribute('text-anchor','middle');
        lbl.setAttribute('fill','url(#textGrad)');
        lbl.setAttribute('font-size','24');
        lbl.setAttribute('letter-spacing','2');
        lbl.setAttribute('filter','url(#glow)');
        lbl.setAttribute('font-weight','bold');
        lbl.setAttribute('font-family','sans-serif');
        lbl.textContent = text;
        svg.appendChild(lbl);
      };
      styleTitle('TECHNOLOGY', 40);
      styleTitle('SOCIETY', h - 20);

      // Filters for glow
      const defs = document.createElementNS(svgNS, 'defs');
      const glow = document.createElementNS(svgNS, 'filter');
      glow.setAttribute('id', 'glow');
      glow.innerHTML = '<feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>';
      defs.appendChild(glow);
      // Gradient for section titles
      const textGradient = document.createElementNS(svgNS, 'linearGradient');
      textGradient.setAttribute('id', 'textGrad');
      textGradient.setAttribute('x1', '0%');
      textGradient.setAttribute('y1', '0%');
      textGradient.setAttribute('x2', '100%');
      textGradient.setAttribute('y2', '0%');
      let stop1 = document.createElementNS(svgNS, 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', '#5A9CF9');
      stop1.setAttribute('stop-opacity', '1');
      let stop2 = document.createElementNS(svgNS, 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', '#A8D1FF');
      stop2.setAttribute('stop-opacity', '1');
      textGradient.appendChild(stop1);
      textGradient.appendChild(stop2);
      defs.appendChild(textGradient);

      // Radial gradients for tech nodes
      ['#D1F0FF','#A8E6CF','#FFD1DC'].forEach((col, i) => {
        const grad = document.createElementNS(svgNS, 'radialGradient');
        grad.setAttribute('id', `techGrad${i}`);
        grad.innerHTML = `<stop offset="0%" stop-color="${col}" stop-opacity="0.8"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/>`;
        defs.appendChild(grad);
      });
      svg.appendChild(defs);

      // Background polygons swirl
      for(let i=0;i<8;i++){
        const poly = document.createElementNS(svgNS, 'polygon');
        const pts=[];
        for(let a=0;a<360;a+=45){
          const rad=(a+i*5)*Math.PI/180;
          const r= (i+1)*50 + 20;
          pts.push([w/2 + Math.cos(rad)*r, h/2 + Math.sin(rad)*r].join(','));
        }
        poly.setAttribute('points', pts.join(' '));
        poly.setAttribute('fill', 'none');
        poly.setAttribute('stroke', '#CCC');
        poly.setAttribute('stroke-width', 1);
        poly.setAttribute('transform', `rotate(${i*15} ${w/2} ${h/2})`);
        svg.appendChild(poly);
      }

      // Technology nodes
      const techNodes = [
        { x: 160, y: 120, label: 'Quantum Hardware',   colorGrad: '#D1F0FF' },
        { x: 400, y: 80,  label: 'Quantum Protocol',   colorGrad: '#A8E6CF' },
        { x: 640, y: 120, label: 'Quantum Software',   colorGrad: '#FFD1DC' },
      ];
      techNodes.forEach((n,i)=>{
        const c=document.createElementNS(svgNS,'circle');
        c.setAttribute('cx',n.x);
        c.setAttribute('cy',n.y);
        c.setAttribute('r',40);
        c.setAttribute('fill',`url(#techGrad${i})`);
        c.setAttribute('filter','url(#glow)');
        svg.appendChild(c);
        const t=document.createElementNS(svgNS,'text');
        t.setAttribute('x',n.x);
        t.setAttribute('y',n.y+60);
        t.setAttribute('text-anchor','middle');
        t.setAttribute('fill','#333');
        t.setAttribute('font-size','14');
        t.textContent=n.label;
        svg.appendChild(t);
      });

      // Expanded social design nodes
      const socialNodes = [
        { x: 80,  y: 380, label: 'Community',   color: '#FF8C94' },
        { x: 240, y: 420, label: 'Education & Outreach',    color: '#FFAAA6' },
        { x: 400, y: 400, label: 'User Experience',         color: '#D1FFD6' },
        { x: 560, y: 420, label: 'Policy & Regulation',     color: '#FFD1DC' },
        { x: 720, y: 380, label: 'Ethics & Governance',     color: '#A8E6CF' },
        { x: 160, y: 320, label: 'Business Model',          color: '#FFDAB9' },
        { x: 640, y: 320, label: 'Infrastructure Design',   color: '#E6E6FA' },
        { x: 320, y: 350, label: 'Sustainability',          color: '#C8E6C9' },
        { x: 480, y: 350, label: 'Data Privacy',            color: '#FFECB3' },
        { x: 560, y: 300, label: 'Inclusive Design',        color: '#D1C4E9' },
        { x: 240, y: 300, label: 'Supply Chain',            color: '#B2DFDB' }
      ];
      socialNodes.forEach((n) => {
        const blob = document.createElementNS(svgNS, 'path');
        const wobble = 20;
        const pts = [
          [n.x,         n.y - wobble],
          [n.x + wobble, n.y],
          [n.x,         n.y + wobble],
          [n.x - wobble, n.y]
        ].map(p => p.join(',')).join(' ');
        blob.setAttribute('d', `M ${pts} Z`);
        blob.setAttribute('fill', n.color);
        blob.setAttribute('fill-opacity', '0.7');
        svg.appendChild(blob);
        const t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', n.x);
        t.setAttribute('y', n.y + 10);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('fill', '#333');
        t.setAttribute('font-size', '14');
        t.textContent = n.label;
        svg.appendChild(t);
      });

      // Curved gradient links
      socialNodes.forEach((sn)=>{
        techNodes.forEach((tn)=>{
          const link= document.createElementNS(svgNS,'path');
          const d=`M ${tn.x} ${tn.y+40} C ${tn.x} ${(tn.y+sn.y)/2} ${sn.x} ${(tn.y+sn.y)/2} ${sn.x} ${sn.y-40}`;
          link.setAttribute('d',d);
          link.setAttribute('fill','none');
          link.setAttribute('stroke','#AAA');
          link.setAttribute('stroke-width','2');
          link.setAttribute('stroke-dasharray','4 4');
          svg.appendChild(link);
        });
      });

      // Central glowing title
      const title=document.createElementNS(svgNS,'text');
      title.setAttribute('x',w/2);
      title.setAttribute('y',h/2);
      title.setAttribute('text-anchor','middle');
      title.setAttribute('fill','#222');
      title.setAttribute('font-size','22');
      title.setAttribute('font-weight','bold');
      title.setAttribute('filter','url(#glow)');
      title.textContent='Quantum Internet Society Design';
      svg.appendChild(title);

    })();
  </script>
</section>

<section id="latest-news" class="news-band" data-reveal>
  <style>
    /* LP Latest News band (EN) */
    .news-band{
      margin: 1.5rem 0;
      padding: 0.75rem 0.75rem 0.75rem;
      border: 1px solid var(--c-border, #eaeef3);
      border-radius: 12px;
      background: linear-gradient(180deg,#f5fbff 0%, #ffffff 100%);
    }
    .news-band h2{
      margin: 0 0 .5rem;
      font-size: 1.1rem;
      letter-spacing: .08em;
    }
    .news-band .news-list{
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .news-band .news-item{
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: .6rem;
      padding: .6rem 0;
      border-top: 1px dashed #dbe7f3;
    }
    .news-band .news-item:first-child{
      border-top: 0;
    }
    .news-band time{
      color: #6b7c93;
      font-size: .9rem;
      white-space: nowrap;
    }
    .news-band a{
      text-decoration: none;
      border-bottom: 1px solid transparent;
    }
    .news-band a:hover{
      border-bottom-color: currentColor;
    }
    .news-band .view-all{
      display: inline-block;
      margin: .75rem 0 1rem;
      font-size: .95rem;
    }
    @media (max-width: 520px){
      .news-band .news-item{
        grid-template-columns: 1fr;
      }
      .news-band time{
        order: 2;
      }
    }
  </style>
  <h2>Latest News</h2>
  {% comment %} Prefer _news collection, fallback to _data/news.yml {% endcomment %}
  {% assign coll = site.news %}
  {% if coll and coll.size > 0 %}
    {% assign news_sorted = coll | sort: "date" | reverse %}
    <ul class="news-list">
      {% for item in news_sorted limit:3 %}
        <li class="news-item">
          <time datetime="{{ item.date | date_to_xmlschema }}">{{ item.date | date: "%Y-%m-%d" }}</time>
          <a href="{{ item.url | relative_url }}">
            {% if item.title_en %}{{ item.title_en }}{% else %}{{ item.title }}{% endif %}
          </a>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    {% assign data_news = site.data.news %}
    {% if data_news %}
      {% assign news_sorted = data_news | sort: "date" | reverse %}
      <ul class="news-list">
        {% for n in news_sorted limit:3 %}
          <li class="news-item">
            <time datetime="{{ n.date | date_to_xmlschema }}">{{ n.date | date: "%Y-%m-%d" }}</time>
            {% assign href = nil %}
            {% if n.i18n_en %}
              {% assign href = n.i18n_en %}
            {% elsif n.link_en %}
              {% assign href = n.link_en %}
            {% elsif n.slug_en %}
              {% assign href = '/en/projects/' | append: n.slug_en | append: '/' %}
            {% elsif n.link %}
              {% assign href = n.link %}
            {% elsif n.slug %}
              {% assign href = '/en/projects/' | append: n.slug | append: '/' %}
            {% else %}
              {% assign href = '#' %}
            {% endif %}
            <a href="{{ href | relative_url }}">
              {% if n.title_en %}{{ n.title_en }}{% else %}{{ n.title }}{% endif %}
            </a>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p>No news yet.</p>
    {% endif %}
  {% endif %}
  <a class="view-all" href="{{ '/en/projects/' | relative_url }}">View all news →</a>
</section>

<section id="approach" class="methods-band" data-reveal>
  <style>
    .methods-band{ margin:1.5rem 0; }
    .methods-band h2{ margin:0 0 .5rem; font-size:1.1rem; letter-spacing:.08em; }
    .methods-band .tiles{ display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:.9rem; align-items:stretch; }
    .methods-band .tile{
      position:relative;
      text-align:center;
      border:1px solid var(--c-border,#eaeef3);
      border-radius:14px;
      background:#fff;
      padding:1.2rem 1.4rem;
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:150px;
    }
    .methods-band .tile .icon{
      position:relative;
      z-index:1;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-direction:column;
      gap:.6rem;
      transition: transform .2s ease, opacity .2s ease;
    }
    .methods-band .tile svg{ width:56px; height:56px; display:block; margin:0; flex:0 0 auto; }
    .methods-band .tile figcaption{
      font-weight:600;
      font-size:.8rem;
      line-height:1.6;          /* more vertical spacing for word-per-line */
      letter-spacing:.02em;
      margin:0;
      text-align:center;
      white-space:normal;
      word-break:keep-all;
      overflow-wrap:break-word;
      max-width:100%;
      padding:0 .2rem;
      display:block;
    }
    .methods-band .tile figcaption br {
      display:block;
      content:"";
    }
    @media (max-width: 560px){
      .methods-band .tile{ min-height:84px; }
      .methods-band .tile .icon{ gap:.6rem; flex-direction:column; }
      .methods-band .tile figcaption{ max-width:100%; white-space:normal; }
    }
    .methods-band .view-all{ margin-top:.75rem; }
    .c1{fill:#5AD1FF;}.c2{fill:#A477FF;}.c3{fill:#9CF36B;}.stroke{stroke:#111;stroke-width:1.5;fill:none}

    /* Center caption overlay (updated rules) */
    .approach-overlay{
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity .18s ease;
      z-index: 9999;
      background: rgba(0,0,0,.65);
    }
    .approach-overlay.show{ opacity: 1; pointer-events: auto; }
    .approach-overlay .panel{
      max-width: min(84vw, 920px);
      margin: 0 3vw;
      color: #fff;
      background: linear-gradient(180deg, rgba(8,10,16,.72), rgba(8,10,16,.72)) padding-box;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 16px;
      padding: clamp(1rem, 2.6vw, 1.6rem) clamp(1.1rem, 3vw, 2rem);
      box-shadow: 0 18px 60px rgba(0,0,0,.45);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      font-size: clamp(0.98rem, 1.9vw, 1.22rem);
      line-height: 1.8;
      letter-spacing: .01em;
      text-align: center;
      font-family: 'Inter', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      font-feature-settings: "liga" 1, "calt" 1;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      word-break: keep-all;
      hyphens: auto;
      transform: translateY(6px) scale(.985);
      transition: transform .2s ease, filter .2s ease;
      position: relative;
    }
    .approach-overlay.show .panel{
      transform: translateY(0) scale(1);
    }
    .approach-overlay .panel::after{
      content:"";
      display:block;
      height: 3px;
      margin: .75rem auto 0;
      width: min(180px, 40%);
      border-radius: 2px;
      background: linear-gradient(90deg, #5AD1FF, #A477FF 60%, #9CF36B);
      opacity: .9;
    }
    .approach-overlay .panel .line{ display:block; margin: 0 0 .35em; }
    .approach-overlay .close-btn {
      position: absolute;
      top: .5rem;
      right: .5rem;
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #fff;
      cursor: pointer;
      line-height: 1;
      z-index: 10001;
    }
    .approach-overlay .close-btn:hover {
      color: #f88;
    }
    .approach-overlay .caption-body {
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;
      margin-top: 2rem;
      text-align: left;
    }
    @media (max-width: 600px) {
      .approach-overlay .panel {
        max-width: 94vw;
        max-height: 85vh;
        overflow-y: auto;
        overflow-x: hidden;
        font-size: .9rem;
        line-height: 1.5;
        padding: 1rem;
        text-align: left;
      }
    }
  </style>

  <h2>Approach</h2>
  <div class="tiles">
    <figure class="tile" data-cap-key="sf">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="SF Prototyping">
          <title>SF Prototyping</title>
          <circle cx="60" cy="60" r="28" class="c1" opacity=".25"/>
          <path d="M40 80 L60 30 L80 80 Z" class="stroke"/>
          <circle cx="60" cy="60" r="4" class="c2"/>
        </svg>
        <figcaption>SF<br>Prototyping</figcaption>
      </div>
    </figure>
    <figure class="tile" data-cap-key="cocreation">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="Co-creation Workshops">
          <title>Co-creation Workshops</title>
          <circle cx="40" cy="50" r="8" class="c1"/>
          <circle cx="80" cy="50" r="8" class="c2"/>
          <circle cx="60" cy="80" r="8" class="c3"/>
          <path d="M40 50 L80 50 L60 80 Z" class="stroke"/>
        </svg>
        <figcaption>Co-creation<br>Workshops</figcaption>
      </div>
    </figure>
    <figure class="tile" data-cap-key="behavior">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="Behavior-Change Scenario Planning">
          <title>Behavior-Change Scenario Planning</title>
          <path d="M30 85 C45 75, 55 60, 60 45 C65 30, 80 30, 90 40" class="stroke"/>
          <circle cx="30" cy="85" r="5" class="c1"/>
          <circle cx="60" cy="45" r="5" class="c2"/>
          <circle cx="90" cy="40" r="6" class="c3"/>
        </svg>
        <figcaption>Behavior-Change<br>Scenario</figcaption>
      </div>
    </figure>
    <figure class="tile" data-cap-key="consensus">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="Consensus Building">
          <title>Consensus Building</title>
          <circle cx="60" cy="60" r="28" class="c1" opacity=".18"/>
          <path d="M40 60 L54 72 L82 44" class="stroke"/>
          <circle cx="40" cy="60" r="4" class="c2"/>
          <circle cx="54" cy="72" r="4" class="c3"/>
          <circle cx="82" cy="44" r="4" class="c2"/>
        </svg>
        <figcaption>Consensus<br>Building</figcaption>
      </div>
    </figure>
    <figure class="tile" data-cap-key="social">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="Social-Transformation Scenarios">
          <title>Social-Transformation Scenarios</title>
          <path d="M60 90 V60 M60 60 C60 45 75 45 80 40 M60 60 C60 45 45 45 40 40" class="stroke"/>
          <circle cx="60" cy="90" r="5" class="c1"/>
          <circle cx="80" cy="40" r="6" class="c2"/>
          <circle cx="40" cy="40" r="6" class="c3"/>
        </svg>
        <figcaption>Social-<br>Transformation</figcaption>
      </div>
    </figure>
    <figure class="tile" data-cap-key="collab">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="Collaborative Research">
          <title>Collaborative Research</title>
          <circle cx="60" cy="60" r="28" class="c1" opacity=".25"/>
          <path d="M30 60 L60 30 L90 60 L60 90 Z" class="stroke"/>
        </svg>
        <figcaption>Collaborative<br>Research</figcaption>
      </div>
    </figure>
    <figure class="tile" data-cap-key="implementation">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="Social Implementation">
          <title>Social Implementation</title>
          <circle cx="60" cy="60" r="28" class="c2" opacity=".25"/>
          <path d="M40 80 L60 40 L80 80" class="stroke"/>
          <path d="M50 70 H70 V90 H50 Z" class="stroke"/>
        </svg>
        <figcaption>Social<br>Implementation</figcaption>
      </div>
    </figure>
    <figure class="tile" data-cap-key="speculative">
      <div class="icon">
        <svg viewBox="0 0 120 120" role="img" aria-label="Speculative Design">
          <title>Speculative Design</title>
          <circle cx="60" cy="60" r="28" class="c3" opacity=".25"/>
          <path d="M30 70 Q60 20 90 70" class="stroke"/>
          <circle cx="60" cy="40" r="6" class="c2"/>
        </svg>
        <figcaption>Speculative<br>Design</figcaption>
      </div>
    </figure>
  </div>
  <script>
  (function(){
    var overlay = document.getElementById('approach-caption-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'approach-caption-overlay';
      overlay.className = 'approach-overlay';
      overlay.setAttribute('aria-hidden','true');

      var panel = document.createElement('div');
      panel.className = 'panel';

      // ✕ close button
      var closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.setAttribute('aria-label','Close');
      closeBtn.innerHTML = '✕';
      panel.appendChild(closeBtn);

      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      closeBtn.addEventListener('click', function(){
        overlay.classList.remove('pinned','show');
        overlay.setAttribute('aria-hidden','true');
      });
    }
    var panel = overlay.querySelector('.panel');

    // ===== Captions (load from JSON) =====
    var CAP = null, capPromise = null;
    function loadCaptions(){
      if(CAP) return Promise.resolve(CAP);
      if(capPromise) return capPromise;
      var url = '{{ "/assets/data/approach_captions.json" | relative_url }}';
      capPromise = fetch(url,{cache:'no-store'})
        .then(function(r){ return r.ok ? r.json() : {}; })
        .catch(function(){ return {}; })
        .then(function(json){ CAP = json || {}; return CAP; });
      return capPromise;
    }

    var lang = (document.documentElement.getAttribute('lang') || '{{ page.lang | default: "ja" }}').slice(0,2);

    function bindTile(tile){
      if(!tile.hasAttribute('tabindex')) tile.setAttribute('tabindex','0');
      var key = tile.getAttribute('data-cap-key');
      var fallback = tile.querySelector('figcaption') ? tile.querySelector('figcaption').textContent : '';

      function doShow(){
        loadCaptions().then(function(map){
          var cap = fallback;
          if(key && map && map[key]) cap = map[key][lang] || map[key]['en'] || map[key]['ja'] || fallback;

          // ✕ボタン以外の子要素を削除
          var keepBtn = panel.querySelector('.close-btn');
          Array.from(panel.childNodes).forEach(function(n){ if(n !== keepBtn) panel.removeChild(n); });

          // 本文を caption-body に挿入
          var body = document.createElement('div');
          body.className = 'caption-body';
          body.textContent = cap;
          panel.appendChild(body);

          overlay.classList.add('show','pinned');
          overlay.setAttribute('aria-hidden','false');
        });
      }

      tile.addEventListener('click', function(e){
        e.preventDefault();
        doShow();
      });
    }

    document.querySelectorAll('#approach .tile').forEach(bindTile);
  })();
  </script>
</section>

<section id="activities-preview" class="activities-band" data-reveal>
  <style>
    /* LP Activities preview */
    .activities-band{ margin: 1.5rem 0; }
    .activities-band h2{ margin: 0 0 .5rem; font-size: 1.1rem; letter-spacing: .08em; }
    .activities-band .tiles{ display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: .6rem; }
    .activities-band .tile{ position:relative; border:1px solid var(--c-border,#eaeef3); border-radius:10px; overflow:hidden; background:#fff; }
    .activities-band .tile img{ width:100%; height:160px; object-fit:cover; display:block; }
    .activities-band .tile h4{ position:absolute; left:0; right:0; bottom:0; margin:0; padding:.5rem .6rem; font-size:.98rem; color:#fff; background:linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.65) 100%); }
    .activities-band .view-all{ margin-top:.75rem; }
  </style>

  <h2>{% if page.lang == "en" %}Activities{% else %}活動報告{% endif %}</h2>

  {% assign base = site.data.activities %}
  {% if base %}
    {% assign featured = base | where_exp: 'a','a.featured_order' | sort: 'featured_order' %}
    {% if featured and featured.size > 0 %}
      {% assign items = featured | slice: 0, 5 %}
    {% else %}
      {% assign items = base | sort: 'date' | reverse | slice: 0, 5 %}
    {% endif %}
    <div class="tiles">
      {% for a in items %}
        {% assign thumb = a.thumbnail | default: a.image %}
        {% assign slug_key = a.slug_en | default: a.slug %}
        {% capture href %}
          {% if page.lang == "en" %}
            {% if a.link_en %}
              {{ a.link_en | relative_url }}
            {% elsif slug_key %}
              {{ '/en/activities/' | append: slug_key | relative_url }}
            {% elsif a.link %}
              {{ a.link | relative_url }}
            {% else %}
              #
            {% endif %}
          {% else %}
            {% if a.link %}
              {{ a.link | relative_url }}
            {% elsif a.slug %}
              {{ '/activities/' | append: a.slug | relative_url }}
            {% else %}
              #
            {% endif %}
          {% endif %}
        {% endcapture %}
        <a class="tile" href="{{ href | strip }}">
          {% if thumb %}<img src="{{ '/assets/img/activities/' | append: thumb | relative_url }}" alt="{{ a.title_en | default: a.title }}">{% endif %}
          <h4>{% if page.lang == "en" and a.title_en %}{{ a.title_en }}{% else %}{{ a.title }}{% endif %}</h4>
        </a>
      {% endfor %}
    </div>
  {% else %}
    <p>{% if page.lang == "en" %}Preparing activities...{% else %}活動データを準備中です。{% endif %}</p>
  {% endif %}

  <p class="view-all">
    <a href="{{ '/en/activities/' | relative_url }}">
      {% if page.lang == "en" %}View all activities →{% else %}すべての活動を見る →{% endif %}
    </a>
  </p>
</section>

<section class="quest-contact" data-reveal>
  <h2 class="chapter">Contact</h2>
  {% if page.lang == "en" %}
    <p>Please contact us using the form below.</p>
    <ul class="contact-list">
      <li>KMD: 4-1-1 Hiyoshi, Kohoku-ku, Yokohama, Kanagawa</li>
      <li>Q/EST: 7-7 Shinkawasaki, Saiwai-ku, Kawasaki, Kanagawa</li>
    </ul>
    <div style="text-align:center; margin: 2em 0;">
      <a href="https://forms.gle/WhzwMF4iz6G1PrDf9"
         target="_blank" rel="noopener"
         class="btn get-in-touch"
         style="padding:0.8em 1.6em;
                background:#0050ff;
                color:#ffffff;
                font-size:1.2em;
                border-radius:8px;
                text-decoration:none;
                display:inline-block;">
        Contact&nbsp;Us
      </a>
    </div>
  {% else %}
    <p>ご連絡は下記フォームからどうぞ。</p>
    <ul class="contact-list">
      <li>KMD：横浜市港北区日吉 4-1-1 慶應義塾大学日吉協生館</li>
      <li>Q/est：神奈川県川崎市幸区新川崎7-7 かわさき新産業創造センター</li>
    </ul>
    <div style="text-align:center; margin: 2em 0;">
      <a href="https://forms.gle/WhzwMF4iz6G1PrDf9"
         target="_blank" rel="noopener"
         class="btn get-in-touch"
         style="padding:0.8em 1.6em;
                background:#0050ff;
                color:#ffffff;
                font-size:1.2em;
                border-radius:8px;
                text-decoration:none;
                display:inline-block;">
        Contact&nbsp;Us
      </a>
    </div>
  {% endif %}
</section>