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
    #news .news-list{
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 960px;
      margin-inline: auto;
    }
    #news .news-item{
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--c-border, #e5e5e5);
    }
    #news .news-item:last-child{
      border-bottom: none;
      padding-bottom: 0;
    }
    #news .news-thumb{
      flex: 0 0 260px;
      max-width: 260px;
    }
    #news .news-thumb img{
      display: block;
      width: 100%;
      height: auto;
      border-radius: 8px;
      object-fit: cover;
    }
    #news .news-body{
      flex: 1 1 260px;
      min-width: 0;
    }
    #news .news-title{
      margin: 0 0 .5rem;
      font-size: 1.1rem;
      line-height: 1.4;
    }
    #news .news-meta{
      margin: 0 0 .25rem;
      font-size: .9rem;
      opacity: .7;
    }
    #news .news-desc{
      margin: 0 0 .75rem;
    }
    #news .btn-quest{
      margin-top: .25rem;
    }
    @media (max-width: 640px){
      #news .news-item{
        flex-direction: column;
      }
      #news .news-thumb{
        flex-basis: auto;
        max-width: 100%;
      }
    }
  </style>

  {% assign news = site.data.news %}
  {% if news %}
    {% assign news = news | sort: "date" | reverse %}
    <ul class="news-list">
    {% for n in news %}
      <li class="news-item" data-reveal>
        {% if n.thumbnail or n.image %}
          <div class="news-thumb">
            {% assign thumb = n.thumbnail | default: n.image %}
            {% if thumb contains '/' %}
              <img src="{{ thumb | relative_url }}" alt="{{ n.title_en | default: n.title | escape }}" loading="lazy">
            {% else %}
              <img src="{{ '/assets/img/news/' | append: thumb | relative_url }}" alt="{{ n.title_en | default: n.title | escape }}" loading="lazy">
            {% endif %}
          </div>
        {% endif %}
        <div class="news-body">
          {% assign post = nil %}
          {% if n.slug_en %}
            {% assign post = site.news | where: "slug", n.slug_en | where: "lang", "en" | first %}
          {% endif %}
          {% if post == nil %}
            {% assign post = site.news | where: "slug", n.slug | where: "lang", "en" | first %}
          {% endif %}

          {% if n.i18n_en %}
            {% assign href = n.i18n_en %}
          {% elsif n.link_en %}
            {% assign href = n.link_en %}
          {% elsif post %}
            {% assign href = post.url %}
          {% elsif n.link %}
            {% assign href = n.link %}
          {% elsif n.slug_en %}
            {% assign href = '/en/projects/' | append: n.slug_en %}
          {% else %}
            {% assign href = '/en/projects/' | append: n.slug %}
          {% endif %}
          {% if n.date %}
            <p class="news-meta">{{ n.date | date: "%Y-%m-%d" }}</p>
          {% endif %}
          <h4 class="news-title">
            <a href="{{ href | relative_url }}">
              {{ n.title_en | default: n.title }}
            </a>
          </h4>
          {% if n.desc or n.desc_en %}
            <p class="news-desc">{% if n.desc_en %}{{ n.desc_en }}{% else %}{{ n.desc }}{% endif %}</p>
          {% endif %}
          <a href="{{ href | relative_url }}" class="btn-quest">
            See more
          </a>
        </div>
      </li>
    {% endfor %}
    </ul>
  {% else %}
    <p>No news yet.</p>
  {% endif %}
</section>