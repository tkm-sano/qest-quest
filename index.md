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
  {% if page.lang == "en" %}
    <p class="lead">Designing and realizing the near-future IT paradigm with Quantum Internet</p>
    <a class="btn-quest" href="{{ '/projects/' | relative_url }}?lang={{ page.lang }}">Let's embark on a quest →</a>
  {% else %}
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
  <script defer src="{{ '/assets/js/design.js' | relative_url }}"></script>
  <script src="{{ '/assets/js/index.js' | relative_url }}"></script>
  <div style="text-align:center;">
    <div id="sd-root" data-mode="compact" style="display:inline-block; text-align:center;"></div>
  </div>
  <h2 id="hero-slideshow-title" style="font-size:2.8rem; text-align:center; margin:3rem 0 1.2rem; font-weight:700;">
    Contents
  </h2>

  {% assign slides = page.hero_slides %}
  {% assign slides_size = 0 %}
  {% if slides %}{% assign slides_size = slides | size %}{% endif %}

  {% if slides_size > 0 %}
    <div class="qest-hero" role="region" aria-roledescription="carousel" aria-label="{% if page.lang == 'en' %}Featured carousel{% else %}Contents{% endif %}">
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
    .news-band .news-text{
      font-size: .95rem;
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


  {% assign data_news = site.data.news %}
  {% assign coll = site.news %}
  {% if data_news and data_news.size > 0 %}
    {% assign news_sorted = data_news | sort: "date" | reverse %}
    <ul class="news-list">
      {% for n in news_sorted limit:3 %}
        <li class="news-item">
          <time datetime="{{ n.date | date_to_xmlschema }}">{{ n.date | date: "%Y-%m-%d" }}</time>
          <span class="news-text">
            {% if page.lang == "en" and n.title_en %}{{ n.title_en }}{% else %}{{ n.title }}{% endif %}
          </span>
        </li>
      {% endfor %}
    </ul>
  {% elsif coll and coll.size > 0 %}
    {% assign news_sorted = coll | sort: "date" | reverse %}
    <ul class="news-list">
      {% for item in news_sorted limit:3 %}
        <li class="news-item">
          <time datetime="{{ item.date | date_to_xmlschema }}">{{ item.date | date: "%Y-%m-%d" }}</time>
          <span class="news-text">
            {% if page.lang == "en" and item.title_en %}{{ item.title_en }}{% else %}{{ item.title }}{% endif %}
          </span>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>{% if page.lang == "en" %}No news yet.{% else %}ニュースはまだありません。{% endif %}</p>
  {% endif %}

  <a class="view-all" href="{{ '/projects/' | relative_url }}">
    {% if page.lang == "en" %}View all news →{% else %}すべてのNEWSを見る →{% endif %}
  </a>
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