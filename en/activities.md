---
title: Activities
lang: en
layout: default
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter II :: ACTIVITIES ::">
    <em>:: ACTIVITIES ::</em>
  </h1>
  <p class="lead">Browse the list of activity reports.</p>
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
    .card img{ width:100%; height:130px; object-fit:cover; display:block; }
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
    <button data-type="">All</button>
    <button data-type="workshop">Workshop</button>
    <button data-type="prototyping">Prototyping</button>
    <button data-type="scenario">Scenario</button>
    <button data-type="talk">Talk</button>
    <button data-type="exhibit">Exhibit</button>
    <button data-type="award">Award</button>
  </div>

  {% assign base = site.data.activities | default: empty %}
  {% if base and base.size > 0 %}
    <ul id="acts" class="cards">
      {% assign items = base | sort: "date" | reverse %}
      {% for a in items %}
        {% assign thumb = a.thumbnail | default: a.image %}
        {% capture href %}{% if a.slug %}{{ '/activities/' | append: a.slug | relative_url }}{% elsif a.link %}{{ a.link }}{% else %}#{% endif %}{% endcapture %}
        <li class="card" data-type="{{ a.type | default: 'activity' }}">
          {% if thumb %}<a href="{{ href }}"><img src="{{ '/assets/img/activities/' | append: thumb | relative_url }}" alt=""></a>{% endif %}
          <h3><a href="{{ href }}">{{ a.title_en | default: a.title }}</a></h3>
          <div class="meta">
            <span>{{ a.date | date: "%Y-%m-%d" }}</span>
            {% if a.location %}<span>· {{ a.location }}</span>{% endif %}
            {% if a.method %}<span>· {{ a.method | join: ', ' }}</span>{% endif %}
          </div>
        </li>
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
    <p>Activities data is being prepared.</p>
  {% endif %}
</section>
