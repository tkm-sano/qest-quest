---
title: News
lang: ja
layout: default
nav_order: 3
permalink: /projects/
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter III :: NEWS ::">
    <em>:: NEWS ::</em>
  </h1>
  <p class="lead">このページでは、プロジェクトの最新ニュースを掲載します。<br />
  関連する研究・イベント・制作など量子技術と社会応用に関する情報をお届けします。</p>
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
                <img src="{{ thumb | relative_url }}" alt="{{ n.title | default: n.title_en | escape }}" loading="lazy">
              {% else %}
                <img src="{{ '/assets/img/news/' | append: thumb | relative_url }}" alt="{{ n.title | default: n.title_en | escape }}" loading="lazy">
              {% endif %}
            </div>
          {% endif %}
          <div class="news-body">
            {% assign post = site.news | where: "slug", n.slug | first %}
            {% if post %}
              {% assign href = post.url %}
            {% elsif n.link %}
              {% assign href = n.link %}
            {% else %}
              {% assign href = '/projects/' | append: n.slug %}
            {% endif %}
            {% if n.date %}
              <p class="news-meta">{{ n.date | date: "%Y-%m-%d" }}</p>
            {% endif %}
            <h4 class="news-title">
              <a href="{{ href | relative_url }}">{{ n.title | default: n.title_en }}</a>
            </h4>
            {% if n.desc or n.desc_en %}
              <p class="news-desc">{{ n.desc | default: n.desc_en }}</p>
            {% endif %}
            <a href="{{ href | relative_url }}" class="btn-quest">
              もっと見る
            </a>
          </div>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>ニュースはまだありません。</p>
  {% endif %}
</section>