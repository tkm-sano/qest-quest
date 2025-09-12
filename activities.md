---
title: 活動報告
lang: ja
layout: default
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter II :: ACTIVITIES ::">
    <em>:: ACTIVITIES ::</em>
  </h1>
  <p class="lead">活動レポートを一覧でご覧いただけます。</p>
</section>

<section id="activities-list" data-reveal>
  <style>
    .filters { display:flex; flex-wrap:wrap; gap:.5rem; margin:.5rem 0 1rem; justify-content:center; }
    .filters button{ border:1px solid var(--c-border,#e5e5e5); background:#fff; padding:.35rem .7rem; border-radius:999px; cursor:pointer; }
    .filters button.is-active{ background:#f5fbff; border-color:#cfe3ff; }
    #activities-list{ display:block; width:100%; max-width:none; }
    .cards{
      display:grid !important;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
      grid-auto-flow: row;
      grid-auto-rows: auto !important; /* rows fit content */
      align-content: start;
      align-items: stretch;
      justify-items: stretch;
      gap:1rem !important;
      list-style:none;
      padding:0;
      margin:0;
      width:100%;
      box-sizing: border-box;
    }
    /* Desktop: exactly 3 columns */
    @media (min-width: 1024px){
      .cards{ grid-template-columns: repeat(3, 1fr) !important; }
    }
    .cards, .cards *{ box-sizing: border-box; }
    .cards > li{ position:relative !important; min-width:0; float:none !important; clear:none !important; }
    .card{ display:flex !important; position:relative !important; flex-direction:column; height:auto; width:100%; box-shadow:0 2px 6px rgba(0,0,0,.05); transition:box-shadow .2s ease; }
    .card:hover{ box-shadow:0 8px 18px rgba(0,0,0,.10); }
    .card img{ width:100%; height:auto; object-fit:contain; display:block; border:none; box-shadow:none; }
    .card h3{ margin:.6rem .8rem .3rem; font-size:1rem; line-height:1.35; }
    .meta{ margin:0 .8rem .8rem; font-size:.85rem; color:#666; display:flex; gap:.4rem; flex-wrap:wrap; }
    /* Full-bleed layout on desktop to guarantee 3 columns */
    @media (min-width: 1024px){
      /* break this section out of any narrow page wrapper */
      #activities-list{ width:100vw !important; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); }
      /* center the grid within a max width */
      #activities-list .cards{ max-width: 1200px; margin: 0 auto; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    }
  </style>

  <div class="filters">
    <button data-type="">すべて</button>
    <button data-type="workshop">ワークショップ</button>
    <button data-type="prototyping">プロトタイピング</button>
    <button data-type="scenario">シナリオ</button>
    <button data-type="talk">講演</button>
    <button data-type="exhibit">展示</button>
    <button data-type="award">受賞</button>
  </div>

  {% assign base = site.data.activities | default: empty %}
  {% if base and base.size > 0 %}
    <ul id="acts" class="cards">
      {% assign items = base | sort: "date" | reverse %}
      {% for a in items %}
        {% assign thumb = a.thumbnail | default: a.image %}
        {% assign slug_key = a.slug %} {# JP uses JP slug #}
        {% assign post = site.activities | where: "slug", slug_key | where: "lang", "ja" | first %}
        {% if post or a.link %}
          {% if a.link %}
            {% assign href = a.link | relative_url %}
          {% else %}
            {% assign href = post.url | relative_url %}
          {% endif %}
          <li class="card" data-type="{{ a.type | default: 'activity' }}">
            {% if thumb %}<img src="{{ '/assets/img/activities/' | append: thumb | relative_url }}" alt="{{ post.title | default: a.title }}" loading="lazy">{% endif %}
            <h3><a href="{{ href }}">{{ post.title | default: a.title }}</a></h3>
            <div class="meta">
              <span>{{ a.date | date: "%Y-%m-%d" }}</span>
              {% if a.location %}<span>· {{ a.location }}</span>{% endif %}
              {% if a.method %}<span>· {{ a.method | join: ', ' }}</span>{% endif %}
            </div>
          </li>
        {% endif %}
      {% endfor %}
    </ul>
    <script>
      (function(){
        const state={type:''};
        const items=[...document.querySelectorAll('#acts .card')];
        function apply(){ items.forEach(el=>{el.style.display = !state.type || el.dataset.type===state.type ? '' : 'none';}); }
        document.querySelectorAll('.filters [data-type]').forEach(b=>{
          b.addEventListener('click',()=>{ document.querySelectorAll('.filters [data-type]').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); state.type=b.dataset.type; apply(); });
        });
        apply();
      })();
    </script>
  {% else %}
    <p>活動データを準備中です。</p>
  {% endif %}
</section>