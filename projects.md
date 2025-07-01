---
title: Projects   # ページごとに変更
lang: ja
layout: default
nav_order: 3     # ナビの並び順。お好みで
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter III :: PROJECT ::">
    <span>Chapter&nbsp;III</span><em>:: PROJECT ::</em>
  </h1>
  {% if page.lang == "en" %}
    <p class="lead">Aiming to realize a near‑future IT paradigm driven by the Quantum Internet, we design a society transformed by quantum computers and quantum‑network technologies.<br />
    We work on R&amp;D that bridges today’s quantum technology with tomorrow’s social systems, envisioning daily life in an age where quantum is as commonplace as AI is today.</p>
  {% else %}
    <p class="lead">量子インターネットによる近未来ITパラダイムの実現を目指し、量子コンピュータ・量子インターネットで変革された社会の姿をデザインします。<br />
    AI社会の後に来る、量子技術が当たり前となった社会における生活、現在の量子技術と近未来の社会システムとの融合、そこに至るテクノロジーの研究開発に取り組みます。</p>
  {% endif %}
</section>
<div class="cards">
  {% for p in site.data.projects %}
  <div class="card" data-reveal>
    <img src="{{ '/assets/img/projects/' | append: p.image | relative_url }}" alt="">
    <h3>{% if page.lang == "en" and p.title_en %}{{ p.title_en }}{% else %}{{ p.title }}{% endif %}</h3>
    <p>{% if page.lang == "en" and p.desc_en %}{{ p.desc_en }}{% else %}{{ p.desc }}{% endif %}</p>
    {% if p.link %}
      <a href="{{ p.link | relative_url }}" class="btn-quest" target="_blank">
        {% if page.lang == "en" and p.button_en %}
          {{ p.button_en }}
        {% elsif p.button %}
          {{ p.button }}
        {% else %}
          {{ p.title }}
        {% endif %}
      </a>
    {% endif %}
  </div>
  {% endfor %}
</div>