---
title: Vision
lang: ja
layout: default
nav_order: 1     # ナビの並び順。お好みで
hero_slider_interval: 5000   # 自動切替ミリ秒
hero_slides:
  - src: /assets/img/approach/sf.jpg
    link: /projects/
    alt_jp: "SFプロトタイピングのイメージ"
    alt_en: "SF Prototyping"
    caption_jp: "SFプロトタイピング — 未来像の素描から議論をはじめる"
    caption_en: "SF Prototyping — Start from vivid future sketches"
    cta_text_jp: "プロジェクトを見る"
    cta_text_en: "See projects"
    cta_url_jp: /projects/
    cta_url_en: /en/projects/
  - src: /assets/img/approach/cocreation.jpg
    link: /activities/
    alt_jp: "共創ワークショップの様子"
    alt_en: "Co-creation workshop"
    caption_jp: "共創ワークショップ — 2040/2050のユースケース創出"
    caption_en: "Co-creation Workshops — Generate 2040/2050 use cases"
    cta_text_jp: "活動を見る"
    cta_text_en: "See activities"
    cta_url_jp: /activities/
    cta_url_en: /en/activities/
  - src: /assets/img/approach/behavior.jpg
    link: /method/
    alt_jp: "行動変容シナリオの図"
    alt_en: "Behavior-change scenario"
    caption_jp: "行動変容シナリオ — 日常から考える"
    caption_en: "Behavior-change scenarios — From everyday life"
    cta_text_jp: "方法論"
    cta_text_en: "Method"
    cta_url_jp: /method/
    cta_url_en: /en/method/
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter I :: VISION ::">
    <em>:: VISION ::</em>
  </h1>
  {% if page.lang == "en" %}
    <p class="lead">Designing and realizing the near-future IT paradigm with Quantum Internet</p>
    <a class="btn-quest" href="{{ '/projects/' | relative_url }}?lang={{ page.lang }}">Let's embark on a quest →</a>
  {% else %}
    <p class="lead">量子インターネットによる近未来ITパラダイムの社会デザインと実現</p>
  {% endif %}
</section>
<section class="hero-slideshow" data-reveal aria-labelledby="hero-slideshow-title">
  <style>
    /* ===== Q/est Hero Slideshow (vanilla, accessible) ===== */
    .qest-hero{position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--c-border,#eaeef3);background:#000;isolation:isolate}
    .qest-hero .track{position:relative;aspect-ratio:16/9}
    .qest-hero .slide{position:absolute;inset:0;opacity:0;transition:opacity .7s ease;display:block}
    .qest-hero .slide.is-active{opacity:1}
    .qest-hero .slide a{display:block;height:100%}
    .qest-hero img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.06);transition:transform 10s ease}
    .qest-hero .slide.is-active img{transform:scale(1.02)}
    .qest-hero .veil{position:absolute;inset:0;background:
      radial-gradient(120% 120% at 10% 10%, rgba(90,209,255,.25), transparent 40%),
      radial-gradient(100% 100% at 90% 0%, rgba(164,119,255,.25), transparent 46%),
      radial-gradient(100% 120% at 50% 100%, rgba(0,0,0,.55), rgba(0,0,0,.65) 60%, rgba(0,0,0,.75) 100%);
      pointer-events:none}
    .qest-hero .caption{
      position:absolute;left: clamp(12px,3vw,24px); right: clamp(12px,3vw,24px); bottom: clamp(12px,3vw,24px);
      color:#fff; z-index:2;
      display:grid; gap:.4rem;
      text-shadow: 0 4px 16px rgba(0,0,0,.5);
    }
    .qest-hero .caption h2{ margin:0; font-size: clamp(1.05rem, 1.8vw, 1.6rem); font-weight:700; letter-spacing:.02em }
    .qest-hero .caption p{ margin:0; font-size: clamp(.92rem, 1.4vw, 1.1rem); opacity:.95 }
    .qest-hero .cta-row{display:flex; gap:.6rem; flex-wrap:wrap; margin-top:.4rem}
    .qest-hero .btn{display:inline-block; padding:.55em .9em; border-radius:12px; border:1px solid rgba(255,255,255,.75); color:#fff; text-decoration:none; backdrop-filter:saturate(120%) blur(2px)}
    .qest-hero .btn.primary{background:rgba(255,255,255,.12)}
    .qest-hero .nav{position:absolute;inset-inline:0;bottom:8px;display:flex;justify-content:center;gap:8px;z-index:3}
    .qest-hero .dot{width:10px;height:10px;border-radius:50%;border:1px solid #fff;background:transparent;opacity:.75}
    .qest-hero .dot[aria-current="true"]{background:#fff;opacity:1}
    .qest-hero .prev,.qest-hero .next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.45);color:#fff;border:none;border-radius:999px;width:38px;height:38px;cursor:pointer;z-index:3}
    .qest-hero .prev{left:8px}.qest-hero .next{right:8px}
    .qest-hero .pause{position:absolute;right:8px;top:8px;background:rgba(0,0,0,.45);color:#fff;border:none;border-radius:10px;padding:.35em .55em;cursor:pointer;z-index:3}
    @media (max-width: 720px){ .qest-hero .caption h2{font-size:1.05rem} .qest-hero .caption p{font-size:.95rem} }
    @media (prefers-reduced-motion: reduce){
      .qest-hero img{transition:none; transform:none}
      .qest-hero .slide{transition:none}
    }
  </style>

  <h2 id="hero-slideshow-title" class="visually-hidden">{% if page.lang == "en" %}Featured{% else %}注目コンテンツ{% endif %}</h2>

  {% assign slides = page.hero_slides %}
  {% assign slides_size = 0 %}
  {% if slides %}{% assign slides_size = slides | size %}{% endif %}

  {% if slides_size > 0 %}
    <div class="qest-hero" role="region" aria-roledescription="carousel" aria-label="{% if page.lang == 'en' %}Featured carousel{% else %}注目スライド{% endif %}">
      <div class="track" id="qestHeroTrack" tabindex="0">
        {% for s in slides %}
          {% assign alt_txt = '' %}
          {% if page.lang == 'ja' and s.alt_jp and s.alt_jp != '' %}{% assign alt_txt = s.alt_jp %}{% endif %}
          {% if page.lang == 'en' and s.alt_en and s.alt_en != '' %}{% assign alt_txt = s.alt_en %}{% endif %}
          {% if alt_txt == '' and s.alt and s.alt != '' %}{% assign alt_txt = s.alt %}{% endif %}

          {% assign cap_txt = '' %}
          {% if page.lang == 'ja' and s.caption_jp and s.caption_jp != '' %}{% assign cap_txt = s.caption_jp %}{% endif %}
          {% if page.lang == 'en' and s.caption_en and s.caption_en != '' %}{% assign cap_txt = s.caption_en %}{% endif %}
          {% if cap_txt == '' and s.caption and s.caption != '' %}{% assign cap_txt = s.caption %}{% endif %}

          {% assign cta_text = '' %}
          {% assign cta_url = '' %}
          {% if page.lang == 'ja' and s.cta_text_jp and s.cta_text_jp != '' %}{% assign cta_text = s.cta_text_jp %}{% endif %}
          {% if page.lang == 'en' and s.cta_text_en and s.cta_text_en != '' %}{% assign cta_text = s.cta_text_en %}{% endif %}
          {% if page.lang == 'ja' and s.cta_url_jp and s.cta_url_jp != '' %}{% assign cta_url = s.cta_url_jp %}{% endif %}
          {% if page.lang == 'en' and s.cta_url_en and s.cta_url_en != '' %}{% assign cta_url = s.cta_url_en %}{% endif %}
          {% if cta_url == '' and s.link and s.link != '' %}{% assign cta_url = s.link %}{% endif %}

          <figure class="slide{% if forloop.first %} is-active{% endif %}" data-index="{{ forloop.index0 }}">
            {% if s.link and s.link != '' %}
              <a href="{{ s.link | relative_url }}" tabindex="-1">
                <img src="{{ s.src | relative_url }}" alt="{{ alt_txt | escape }}" {% if forloop.first %}loading="eager"{% else %}loading="lazy"{% endif %} decoding="async">
              </a>
            {% else %}
              <img src="{{ s.src | relative_url }}" alt="{{ alt_txt | escape }}" {% if forloop.first %}loading="eager"{% else %}loading="lazy"{% endif %} decoding="async">
            {% endif %}
            <div class="veil" aria-hidden="true"></div>
            {% if cap_txt != '' %}
            <figcaption class="caption">
              <h2>{{ cap_txt }}</h2>
              {% if cta_url != '' and cta_text != '' %}
                <div class="cta-row">
                  <a class="btn primary" href="{{ cta_url | relative_url }}">{{ cta_text }}</a>
                </div>
              {% endif %}
            </figcaption>
            {% endif %}
          </figure>
        {% endfor %}

        <button class="prev" type="button" aria-label="{% if page.lang == 'en' %}Previous slide{% else %}前のスライド{% endif %}">‹</button>
        <button class="next" type="button" aria-label="{% if page.lang == 'en' %}Next slide{% else %}次のスライド{% endif %}">›</button>
        <button class="pause" type="button" aria-pressed="false" aria-label="{% if page.lang == 'en' %}Pause autoplay{% else %}自動再生を一時停止{% endif %}">❚❚</button>
      </div>

      <div class="nav" role="tablist" aria-label="{% if page.lang == 'en' %}Slides{% else %}スライド{% endif %}">
        {% for s in slides %}
          <button class="dot" type="button" role="tab" data-index="{{ forloop.index0 }}" {% if forloop.first %}aria-current="true"{% endif %} aria-label="{% if page.lang == 'en' %}Slide {{ forloop.index }}{% else %}{{ forloop.index }}枚目{% endif %}"></button>
        {% endfor %}
      </div>
    </div>

    <script>
    (function(){
      var track=document.getElementById('qestHeroTrack'); if(!track) return;
      var slides=[].slice.call(track.querySelectorAll('.slide'));
      var dots=[].slice.call(document.querySelectorAll('.hero-slideshow .dot'));
      var prev=track.querySelector('.prev');
      var next=track.querySelector('.next');
      var pauseBtn=track.querySelector('.pause');
      var idx=0, timer=null, interval={{ page.hero_slider_interval | default: 5000 }};

      function show(i){
        slides.forEach(function(el){ el.classList.remove('is-active'); });
        dots.forEach(function(d){ d.removeAttribute('aria-current'); });
        idx=(i+slides.length)%slides.length;
        slides[idx].classList.add('is-active');
        if(dots[idx]) dots[idx].setAttribute('aria-current','true');
      }
      function play(){ stop(); timer=setInterval(function(){ show(idx+1); }, interval); pauseBtn.setAttribute('aria-pressed','false'); pauseBtn.textContent='❚❚'; }
      function stop(){ if(timer){ clearInterval(timer); timer=null; } pauseBtn.setAttribute('aria-pressed','true'); pauseBtn.textContent='▶'; }

      prev.addEventListener('click', function(){ show(idx-1); });
      next.addEventListener('click', function(){ show(idx+1); });
      dots.forEach(function(d){ d.addEventListener('click', function(){ show(parseInt(d.getAttribute('data-index'),10)); }); });
      pauseBtn.addEventListener('click', function(){ if(timer){ stop(); } else { play(); } });

      // Pause on hover/focus and keyboard navigation
      track.addEventListener('mouseenter', stop);
      track.addEventListener('mouseleave', play);
      track.addEventListener('focusin', stop);
      track.addEventListener('focusout', play);
      track.addEventListener('keydown', function(e){
        if(e.key==='ArrowLeft'){ e.preventDefault(); show(idx-1); }
        if(e.key==='ArrowRight'){ e.preventDefault(); show(idx+1); }
      });

      if(slides.length > 1){ play(); }
      else{
        // Hide controls if only one slide
        if(prev) prev.style.display='none';
        if(next) next.style.display='none';
        if(pauseBtn) pauseBtn.style.display='none';
        var nav=document.querySelector('.hero-slideshow .nav'); if(nav) nav.style.display='none';
      }
    })();
    </script>
  {% else %}
    <div class="qest-hero" style="aspect-ratio:16/9;display:grid;place-items:center;color:#fff;background:#111;border-radius:16px;border:1px dashed #333;">
      <p style="margin:0;padding:1rem;text-align:center">{% if page.lang == "en" %}Add `hero_slides` to front matter to enable the hero slideshow.{% else %}front matter に `hero_slides` を追加するとスライドショーが表示されます。{% endif %}</p>
    </div>
  {% endif %}
</section>
<section id="latest-news" class="news-band" data-reveal>
  <style>
    /* LP Latest News band */
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

  <h2>{% if page.lang == "en" %}Latest News{% else %}最新ニュース{% endif %}</h2>

  {% comment %}
    Prefer collection-based news (_news), fallback to data file (_data/news.yml)
  {% endcomment %}

  {% assign coll = site.news %}
  {% if coll and coll.size > 0 %}
    {% assign news_sorted = coll | sort: "date" | reverse %}
    <ul class="news-list">
      {% for item in news_sorted limit:3 %}
        <li class="news-item">
          <time datetime="{{ item.date | date_to_xmlschema }}">{{ item.date | date: "%Y-%m-%d" }}</time>
          <a href="{{ item.url | relative_url }}">
            {% if page.lang == "en" and item.title_en %}{{ item.title_en }}{% else %}{{ item.title }}{% endif %}
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
            <a href="{% if n.slug %}{{ '/projects/' | append: n.slug | append: '/' | relative_url }}{% elsif n.link %}{{ n.link }}{% else %}#{% endif %}">
              {% if page.lang == "en" and n.title_en %}{{ n.title_en }}{% else %}{{ n.title }}{% endif %}
            </a>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p>{% if page.lang == "en" %}No news yet.{% else %}ニュースはまだありません。{% endif %}</p>
    {% endif %}
  {% endif %}

  <a class="view-all" href="{{ '/projects/' | relative_url }}">
    {% if page.lang == "en" %}View all news →{% else %}すべてのNEWSを見る →{% endif %}
  </a>
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
      font-size:.85rem;        /* smaller font to fit long words */
      line-height:1.5;          /* more vertical space */
      letter-spacing:.02em;
      margin:0;
      text-align:center;
      white-space:normal;       /* allow wrapping */
      word-break:break-word;    /* break long words */
      overflow-wrap:anywhere;   /* modern browsers */
      max-width:100%;
      padding:0 .2rem;
    }
    @media (max-width: 560px){
      .methods-band .tile{ min-height:84px; }
      .methods-band .tile .icon{ gap:.6rem; flex-direction:column; }
      .methods-band .tile figcaption{ max-width:100%; white-space:normal; }
    }
    .methods-band .view-all{ margin-top:.75rem; }
    /* brand-ish colors */
    .c1{fill:#5AD1FF;}.c2{fill:#A477FF;}.c3{fill:#9CF36B;}.stroke{stroke:#111;stroke-width:1.5;fill:none}


    /* Center caption overlay (refined: direct dim, solid background, pointer-events toggle) */
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
      /* glassy black */
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
    /* accent underline */
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
    /* readable whites on dark */
    .approach-overlay .panel .line{ display:block; margin: 0 0 .35em; }
    .approach-overlay .caption-body {
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;
      margin-top: 2rem;
      text-align: left;
    }
    @media (max-width: 600px){
      .approach-overlay .panel{
        max-width: 94vw;
        max-height: 85vh;
        overflow-y: auto;
        overflow-x: hidden;
        font-size: .9rem;
        line-height: 1.5;
        padding: 1rem;
        text-align: left;
      }
      .approach-overlay .panel::-webkit-scrollbar{ width:6px; }
      .approach-overlay .panel::-webkit-scrollbar-thumb{ background: rgba(255,255,255,.3); border-radius: 3px; }
    }
    @media (prefers-reduced-motion: no-preference){
      .approach-overlay { transition: opacity .18s ease; }
    }
    .approach-overlay .close-btn { position:absolute; top:.5rem; right:.5rem; background:transparent; border:none; font-size:1.5rem; color:#fff; cursor:pointer; line-height:1; z-index:10001; }
    .approach-overlay .close-btn:hover { color:#f88; }
    /* Dim tile icon on hover/focus for context */
    .methods-band .tile:hover .icon,
    .methods-band .tile:focus-within .icon{
      transform: scale(.95);
      opacity:.12;
    }
  </style>

  {% if page.lang == "en" %}
    <h2>Approach</h2>
    <div class="tiles">
      <figure class="tile" data-img="/assets/img/approach/sf.jpg" data-cap-key="sf">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="SF Prototyping">
            <title>SF Prototyping</title>
            <circle cx="60" cy="60" r="28" class="c1" opacity=".25"/>
            <path d="M40 80 L60 30 L80 80 Z" class="stroke"/>
            <circle cx="60" cy="60" r="4" class="c2"/>
          </svg>
          <figcaption>SF Prototyping</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/cocreation.jpg" data-cap-key="cocreation">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="Co-creation Workshops">
            <title>Co-creation Workshops</title>
            <circle cx="40" cy="50" r="8" class="c1"/>
            <circle cx="80" cy="50" r="8" class="c2"/>
            <circle cx="60" cy="80" r="8" class="c3"/>
            <path d="M40 50 L80 50 L60 80 Z" class="stroke"/>
          </svg>
          <figcaption>Co-creation Workshops</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/behavior.jpg" data-cap-key="behavior">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="Behavior-Change Scenario Planning">
            <title>Behavior-Change Scenario Planning</title>
            <path d="M30 85 C45 75, 55 60, 60 45 C65 30, 80 30, 90 40" class="stroke"/>
            <circle cx="30" cy="85" r="5" class="c1"/>
            <circle cx="60" cy="45" r="5" class="c2"/>
            <circle cx="90" cy="40" r="6" class="c3"/>
          </svg>
          <figcaption>Behavior-Change Scenario</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/consensus.jpg" data-cap-key="consensus">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="Consensus Building">
            <title>Consensus Building</title>
            <circle cx="60" cy="60" r="28" class="c1" opacity=".18"/>
            <path d="M40 60 L54 72 L82 44" class="stroke"/>
            <circle cx="40" cy="60" r="4" class="c2"/>
            <circle cx="54" cy="72" r="4" class="c3"/>
            <circle cx="82" cy="44" r="4" class="c2"/>
          </svg>
          <figcaption>Consensus Building</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/social.jpg" data-cap-key="social">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="Social-Transformation Scenarios">
            <title>Social-Transformation Scenarios</title>
            <path d="M60 90 V60 M60 60 C60 45 75 45 80 40 M60 60 C60 45 45 45 40 40" class="stroke"/>
            <circle cx="60" cy="90" r="5" class="c1"/>
            <circle cx="80" cy="40" r="6" class="c2"/>
            <circle cx="40" cy="40" r="6" class="c3"/>
          </svg>
          <figcaption>Social-Transformation</figcaption>
        </div>
      </figure>
    </div>
    <p class="view-all"><a href="{{ '/projects/' | relative_url }}">See latest in NEWS →</a></p>
  {% else %}
    <h2>Approach</h2>
    <div class="tiles">
      <figure class="tile" data-img="/assets/img/approach/sf.jpg" data-cap-key="sf">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="SFプロトタイピング">
            <title>SFプロトタイピング</title>
            <circle cx="60" cy="60" r="28" class="c1" opacity=".25"/>
            <path d="M40 80 L60 30 L80 80 Z" class="stroke"/>
            <circle cx="60" cy="60" r="4" class="c2"/>
          </svg>
          <figcaption>SFプロトタイピング</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/cocreation.jpg" data-cap-key="cocreation">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="共創ワークショップ">
            <title>共創ワークショップ</title>
            <circle cx="40" cy="50" r="8" class="c1"/>
            <circle cx="80" cy="50" r="8" class="c2"/>
            <circle cx="60" cy="80" r="8" class="c3"/>
            <path d="M40 50 L80 50 L60 80 Z" class="stroke"/>
          </svg>
          <figcaption>共創ワークショップ</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/behavior.jpg" data-cap-key="behavior">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="行動変容シナリオプランニング">
            <title>行動変容シナリオプランニング</title>
            <path d="M30 85 C45 75, 55 60, 60 45 C65 30, 80 30, 90 40" class="stroke"/>
            <circle cx="30" cy="85" r="5" class="c1"/>
            <circle cx="60" cy="45" r="5" class="c2"/>
            <circle cx="90" cy="40" r="6" class="c3"/>
          </svg>
          <figcaption>行動変容シナリオ</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/consensus.jpg" data-cap-key="consensus">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="未来社会デザインの合意形成">
            <title>未来社会デザインの合意形成</title>
            <circle cx="60" cy="60" r="28" class="c1" opacity=".18"/>
            <path d="M40 60 L54 72 L82 44" class="stroke"/>
            <circle cx="40" cy="60" r="4" class="c2"/>
            <circle cx="54" cy="72" r="4" class="c3"/>
            <circle cx="82" cy="44" r="4" class="c2"/>
          </svg>
          <figcaption>合意形成</figcaption>
        </div>
      </figure>
      <figure class="tile" data-img="/assets/img/approach/social.jpg" data-cap-key="social">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="社会変革シナリオプランニング">
            <title>社会変革シナリオプランニング</title>
            <path d="M60 90 V60 M60 60 C60 45 75 45 80 40 M60 60 C60 45 45 45 40 40" class="stroke"/>
            <circle cx="60" cy="90" r="5" class="c1"/>
            <circle cx="80" cy="40" r="6" class="c2"/>
            <circle cx="40" cy="40" r="6" class="c3"/>
          </svg>
          <figcaption>社会変革シナリオ</figcaption>
        </div>
      </figure>
      <figure class="tile" data-cap-key="collab">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="共同研究">
            <title>共同研究</title>
            <circle cx="60" cy="60" r="28" class="c1" opacity=".25"/>
            <path d="M30 60 L60 30 L90 60 L60 90 Z" class="stroke"/>
          </svg>
          <figcaption>共同研究</figcaption>
        </div>
      </figure>
      <figure class="tile" data-cap-key="implementation">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="社会実装">
            <title>社会実装</title>
            <circle cx="60" cy="60" r="28" class="c2" opacity=".25"/>
            <path d="M40 80 L60 40 L80 80" class="stroke"/>
            <path d="M50 70 H70 V90 H50 Z" class="stroke"/>
          </svg>
          <figcaption>社会実装</figcaption>
        </div>
      </figure>
      <figure class="tile" data-cap-key="speculative">
        <div class="icon">
          <svg viewBox="0 0 120 120" role="img" aria-label="スペキュラティブデザイン">
            <title>スペキュラティブデザイン</title>
            <circle cx="60" cy="60" r="28" class="c3" opacity=".25"/>
            <path d="M30 70 Q60 20 90 70" class="stroke"/>
            <circle cx="60" cy="40" r="6" class="c2"/>
          </svg>
          <figcaption>スペキュラティブデザイン</figcaption>
        </div>
      </figure>
    </div>
  {% endif %}
  <script>
  (function(){
    // ===== Overlay & Panel (with X button) =====
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

      // ✕ボタンでのみ閉じる
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

    // 言語
    var lang = (document.documentElement.getAttribute('lang') || '{{ page.lang | default: "ja" }}').slice(0,2);

    function bindTile(tile){
      if(!tile.hasAttribute('tabindex')) tile.setAttribute('tabindex','0');
      var key = tile.getAttribute('data-cap-key');
      var fallback = tile.querySelector('figcaption') ? tile.querySelector('figcaption').textContent : '';

      function doShow(){
        loadCaptions().then(function(map){
          var cap = fallback;
          if(key && map && map[key]) cap = map[key][lang] || map[key]['en'] || map[key]['ja'] || fallback;

          // ✕以外の子要素を削除して本文を差し替え
          var keepBtn = panel.querySelector('.close-btn');
          Array.from(panel.childNodes).forEach(function(n){ if(n !== keepBtn) panel.removeChild(n); });

          var body = document.createElement('div');
          body.className = 'caption-body';
          body.textContent = cap;
          panel.appendChild(body);

          overlay.classList.add('show','pinned');
          overlay.setAttribute('aria-hidden','false');
        });
      }

      // クリック（タップ）で開く。閉じるのは✕のみ
      tile.addEventListener('click', function(e){ e.preventDefault(); doShow(); });
    }

    document.querySelectorAll('#approach .tile').forEach(bindTile);

    // 背景クリック / パネルクリック / Esc では閉じない（✕のみ）
  })();
  </script>
  <div id="sd-root" data-mode="compact"></div>
  <script src="{{ '/assets/js/index.js' | relative_url }}"></script>
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
        {% if page.lang == "en" %}
          {% assign slug_key = a.slug_en | default: a.slug %}
        {% else %}
          {% assign slug_key = a.slug %}
        {% endif %}
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
            {% elsif slug_key %}
              {{ '/activities/' | append: slug_key | relative_url }}
            {% else %}
              #
            {% endif %}
          {% endif %}
        {% endcapture %}
        <a class="tile" href="{{ href | strip }}">
          {% if thumb %}<img src="{{ '/assets/img/activities/' | append: thumb | relative_url }}" alt="{% if page.lang == 'en' and a.title_en %}{{ a.title_en }}{% else %}{{ a.title }}{% endif %}">{% endif %}
          <h4>{% if page.lang == "en" and a.title_en %}{{ a.title_en }}{% else %}{{ a.title }}{% endif %}</h4>
        </a>
      {% endfor %}
    </div>
  {% else %}
    <p>{% if page.lang == "en" %}Preparing activities...{% else %}活動データを準備中です。{% endif %}</p>
  {% endif %}

  <p class="view-all">
    <a href="{{ '/activities/' | relative_url }}">
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