---
title: Activities   # ページごとに変更
lang: ja
layout: default
nav_order: 3     # ナビの並び順。お好みで
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter III :: ACTIVITIES ::">
    <em>:: ACTIVITIES ::</em>
  </h1>
  {% if page.lang == "en" %}
    <p class="lead">This page showcases our latest activities and news.<br />
    We document SF prototyping, co‑creation workshops, and behavior‑change scenario planning that connect today’s quantum technologies with tomorrow’s social systems.</p>
  {% else %}
    <p class="lead">このページでは、プロジェクトの活動報告とニュースを掲載します。<br />
    現在の量子情報技術と近未来の社会をつなぐ取り組みを紹介します。</p>
  {% endif %}
<style>
  /* Force grid layout for Activities & News even if theme styles conflict */
  #activities .cards,
  #news .cards {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }
  #activities .cards .card,
  #news .cards .card {
    width: auto !important;
    max-width: 100%;
  }
  #activities .card,
  #news .card {
    flex: initial;
  }

  /* Make NEWS cards slightly larger */
  #news .cards {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
  /* NEWS images: show original aspect, larger, not circular */
  #news .card img {
    display: block;
    width: 100%;
    height: auto;             /* no fixed height */
    object-fit: contain;      /* do not crop */
    background: transparent;  /* remove gray bg */
    border-radius: 0 !important; /* never circular */
    box-shadow: none;
  }
  @media (min-width: 640px) {
    #activities .cards,
    #news .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 960px) {
    #activities .cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    #news .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr)); /* prefer 2 columns for larger images */
    }
  }
  @media (min-width: 1280px) {
    #activities .cards,
    #news .cards {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  @media (min-width: 1440px) {
    #news .cards {
      grid-template-columns: repeat(3, minmax(0, 1fr)); /* three columns only on very wide screens */
    }
  }
  /* Flex fallback if CSS Grid is not supported */
  @supports not (display: grid) {
    #activities .cards,
    #news .cards {
      display: flex !important;
      flex-wrap: wrap;
      gap: 1.25rem;
    }
    #activities .cards .card,
    #news .cards .card {
      flex: 1 1 280px;
    }
  }
</style>
</section>

<!-- Activities Section -->
<section id="activities" data-reveal>
  <h2>{% if page.lang == "en" %}Activities{% else %}活動報告{% endif %}</h2>
  {% assign categories = site.data.activity_categories %}
  {% if categories %}
  {% for cat in categories %}
    <h3 class="cat-title">{% if page.lang == "en" and cat.name_en %}{{ cat.name_en }}{% else %}{{ cat.name }}{% endif %}</h3>
    {% assign base = site.data.activities %}
    {% if base %}
      {% assign items = base | where: "category", cat.id | sort: "date" | reverse %}
      <div class="cards">
        {% for a in items %}
        <div class="card" data-reveal>
          <img src="{{ '/assets/img/activities/' | append: a.image | relative_url }}" alt="">
          <h4>{% if page.lang == "en" and a.title_en %}{{ a.title_en }}{% else %}{{ a.title }}{% endif %}</h4>
          <p>{% if page.lang == "en" and a.desc_en %}{{ a.desc_en }}{% else %}{{ a.desc }}{% endif %}</p>
          {% if a.link %}
          <a href="{{ a.link | relative_url }}" class="btn-quest" target="_blank">
            {% if page.lang == "en" and a.button_en %}
              {{ a.button_en }}
            {% elsif a.button %}
              {{ a.button }}
            {% else %}
              {% if page.lang == "en" and a.title_en %}{{ a.title_en }}{% else %}{{ a.title }}{% endif %}
            {% endif %}
          </a>
          {% endif %}
        </div>
        {% endfor %}
      </div>
    {% else %}
      <p>活動データを準備中です。</p>
    {% endif %}
  {% endfor %}
  {% else %}
    <p>活動データを準備中です。</p>
  {% endif %}
</section>

<!-- News Section -->
<section id="news" data-reveal>
  <h2>NEWS</h2>
  {% assign news = site.data.news %}
  {% if news %}
    {% assign news = news | sort: "date" | reverse %}
    {% for n in news %}
      <h4 class="news-title">
        <a href="{{ '/news/' | append: n.slug | relative_url }}">
          {% if page.lang == "en" and n.title_en %}{{ n.title_en }}{% else %}{{ n.title }}{% endif %}
        </a>
      </h4>
      {% if n.desc or n.desc_en %}
      <p class="news-desc">{% if page.lang == "en" and n.desc_en %}{{ n.desc_en }}{% else %}{{ n.desc }}{% endif %}</p>
      {% endif %}
      {% if n.paper or n.paper_en %}
      <p class="meta">
        {% if page.lang == "en" and n.paper_en %}{{ n.paper_en }}{% else %}{{ n.paper }}{% endif %}
      </p>
      {% endif %}
      {% if n.link %}
      <a href="{{ n.link }}" class="btn-quest" target="_blank" rel="noopener">
        {% if page.lang == "en" and n.button_en %}{{ n.button_en }}{% elsif n.button %}{{ n.button }}{% else %}{% if page.lang == "en" %}Details{% else %}詳細{% endif %}{% endif %}
      </a>
      {% endif %}
    {% endfor %}
  {% else %}
    <p>ニュースはまだありません。</p>
  {% endif %}
</section>