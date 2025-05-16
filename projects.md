---
title: Projects   # ページごとに変更
layout: default
nav_order: 3     # ナビの並び順。お好みで
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter III :: PROJECT ::">
    <span>Chapter&nbsp;III</span><em>:: PROJECT ::</em>
  </h1>
    <p class="lead">量子インターネットによる近未来ITパラダイムの実現を目指し、量子コンピュータ・量子インターネットで変革された社会の姿をデザインします。<br />
    AI社会の後に来る、量子技術が当たり前となった社会における生活、現在の量子技術と近未来の社会システムとの融合、そこに至るテクノロジーの研究開発に取り組みます。</p>
</section>
<div class="cards">
  {% for p in site.data.projects %}
  <div class="card" data-reveal>
    <img src="{{ '/assets/img/projects/' | append: p.image | relative_url }}" alt="">
    <h3>{{ p.title }}</h3>
    <p>{{ p.desc }}</p>
    <a href="{{ p.link }}" class="btn-quest" target="_blank">Visit</a>
  </div>
  {% endfor %}
</div>