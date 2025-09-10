---
title: News   # ページごとに変更
lang: ja
layout: default
nav_order: 3     # ナビの並び順。お好みで
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter III :: NEWS ::">
    <em>:: NEWS ::</em>
  </h1>
  {% if page.lang == "en" %}
    <p class="lead">This page showcases our latest news and updates.<br />
    We share information on projects, events, and publications related to quantum technologies and their social applications.</p>
  {% else %}
    <p class="lead">このページでは、プロジェクトの最新ニュースを掲載します。<br />
    関連する研究・イベント・出版など量子技術と社会応用に関する情報をお届けします。</p>
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
  #news .single-news{
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
  }
  #news .single-news img{
    max-width: 100%;
    height: auto;
    margin-bottom: 1rem;
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

<!-- News Section -->
<section id="news" data-reveal>
  <h2>NEWS</h2>
  {% assign news = site.data.news %}
  {% if news %}
    {% assign news = news | sort: "date" | reverse %}
    {% if news.size == 1 %}
      {% assign n = news[0] %}
      <div class="card single-news" data-reveal>
        {% if n.thumbnail or n.image %}
          {% assign thumb = n.thumbnail | default: n.image %}
          {% if thumb contains '/' %}
            <img src="{{ thumb | relative_url }}" alt="">
          {% else %}
            <img src="{{ '/assets/img/news/' | append: thumb | relative_url }}" alt="">
          {% endif %}
        {% endif %}
        <h3 class="news-title">
          <a href="{{ '/news/' | append: n.slug | relative_url }}">
            {% if page.lang == "en" and n.title_en %}{{ n.title_en }}{% else %}{{ n.title }}{% endif %}
          </a>
        </h3>
        {% if n.desc or n.desc_en %}
        <p class="news-desc">{% if page.lang == "en" and n.desc_en %}{{ n.desc_en }}{% else %}{{ n.desc }}{% endif %}</p>
        {% endif %}
        <a href="{{ '/news/' | append: n.slug | relative_url }}" class="btn-quest">
          {% if page.lang == "en" %}See more{% else %}もっと見る{% endif %}
        </a>
      </div>
    {% else %}
      <div class="cards">
      {% for n in news %}
        <div class="card" data-reveal>
          {% if n.thumbnail or n.image %}
            {% assign thumb = n.thumbnail | default: n.image %}
            {% if thumb contains '/' %}
              <img src="{{ thumb | relative_url }}" alt="">
            {% else %}
              <img src="{{ '/assets/img/news/' | append: thumb | relative_url }}" alt="">
            {% endif %}
          {% endif %}
          <h4 class="news-title">
            <a href="{{ '/news/' | append: n.slug | relative_url }}">
              {% if page.lang == "en" and n.title_en %}{{ n.title_en }}{% else %}{{ n.title }}{% endif %}
            </a>
          </h4>
          {% if n.desc or n.desc_en %}
          <p class="news-desc">{% if page.lang == "en" and n.desc_en %}{{ n.desc_en }}{% else %}{{ n.desc }}{% endif %}</p>
          {% endif %}
          <a href="{{ '/news/' | append: n.slug | relative_url }}" class="btn-quest">
            {% if page.lang == "en" %}See more{% else %}もっと見る{% endif %}
          </a>
        </div>
      {% endfor %}
      </div>
    {% endif %}
  {% else %}
    <p>ニュースはまだありません。</p>
  {% endif %}
</section>