---
title: News
lang: en
layout: default
nav_order: 3
permalink: /en/projects/
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter III :: NEWS ::">
    <em>:: NEWS ::</em>
  </h1>
  <p class="lead">This page showcases our latest news and updates.<br />
  We share information on projects, events, and productions related to quantum technologies and their social applications.</p>
</section>

<!-- News Section -->
<section id="news" data-reveal>
  <h2>NEWS</h2>
  <style>
    /* Simple grid for news cards */
    #news .cards{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      align-items: stretch;
    }
    #news .card{
      display: flex;
      flex-direction: column;
      border: 1px solid var(--c-border, #e5e5e5);
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,.04);
    }
    #news .card img{
      width: 100%;
      height: 160px;
      object-fit: cover;
      display: block;
    }
    #news .card h4{
      margin: 0.75rem 1rem 0.25rem;
      font-size: 1.05rem;
      line-height: 1.35;
    }
    #news .card p{
      margin: 0 1rem 1rem;
    }
    #news .card .btn-quest{
      margin: 0 1rem 1rem;
      align-self: flex-start;
    }
    @media (max-width: 600px){
      #news .card img{ height: 140px; }
    }
  </style>

  {% assign news = site.data.news %}
  {% if news %}
    {% assign news = news | sort: "date" | reverse %}
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
          <a href="{% if n.i18n_en %}{{ n.i18n_en | relative_url }}{% else %}{{ '/en/projects/' | append: n.slug | relative_url }}{% endif %}">
            {% if n.title_en %}{{ n.title_en }}{% else %}{{ n.title }}{% endif %}
          </a>
        </h4>
        {% if n.desc or n.desc_en %}
        <p class="news-desc">{% if n.desc_en %}{{ n.desc_en }}{% else %}{{ n.desc }}{% endif %}</p>
        {% endif %}
        <a href="{% if n.i18n_en %}{{ n.i18n_en | relative_url }}{% else %}{{ '/en/projects/' | append: n.slug | relative_url }}{% endif %}" class="btn-quest">
          See more
        </a>
      </div>
    {% endfor %}
    </div>
  {% else %}
    <p>No news yet.</p>
  {% endif %}
</section>