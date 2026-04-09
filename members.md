---
title: Members   # ページごとに変更
lang: ja
layout: default
nav_order: 2     # ナビの並び順。お好みで
---

<section class="hero" data-reveal>
  <div class="container">
    <h1 class="chapter glitch" data-shadow="Chapter II :: MEMBER ::">
    <em>:: MEMBER ::</em>
    </h1>
  </div>
  {% if page.lang == "en" %}
    <p class="lead">Q/est Team</p>
  {% else %}
    <p class="lead">Q/estチーム</p>
  {% endif %}
  <!-- 必要ならボタンや追加要素も配置可能 -->
</section>
<div class="cards members-grid">
  {% for m in site.data.members %}
  <div class="card member-card" data-reveal>
    <img class="member-photo" src="{{ '/assets/img/members/' | append: m.photo | relative_url }}" alt="">
    <h3 class="member-name">
      {{ m.name }}<br>
      {% if page.lang == 'en' and m.role_en %}
        <span class="member-role">{{ m.role_en }}</span>
      {% elsif m.role %}
        <span class="member-role">{{ m.role }}</span>
      {% endif %}
    </h3>
    {% if page.lang == "en" and m.comment_en %}
      <p class="member-comment">{{ m.comment_en }}</p>
    {% else %}
      <p class="member-comment">{{ m.comment }}</p>
    {% endif %}
    {% if m.link %}
      <a href="{{ m.link }}" class="member-link" target="_blank" rel="noopener">Visit</a>
    {% endif %}
  </div>
  {% endfor %}
</div>
