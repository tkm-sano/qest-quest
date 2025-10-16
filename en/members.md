---
title: Members   # ページごとに変更
lang: en
permalink: /en/members.html
layout: default
nav_order: 2     # ナビの並び順。お好みで
slug: members
slug_en: members
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter II :: MEMBER ::">
    <em>:: MEMBER ::</em>
  </h1>
  {% if page.lang == "en" %}
    <p class="lead">Q/est Team</p>
  {% else %}
    <p class="lead">Q/estチーム</p>
  {% endif %}
  <!-- 必要ならボタンや追加要素も配置可能 -->
</section>
<div class="cards">
  {% for m in site.data.members %}
  <div class="card" data-reveal>
    {% assign alt_name = m.name %}
    {% if page.lang == "en" and m.name_en %}
    {% assign alt_name = m.name_en %}
    {% endif %}
    <img src="{{ '/assets/img/members/' | append: m.photo | relative_url }}" alt="{{ alt_name }}">
    <h3>
      {% if page.lang == 'en' and m.name_en %}
        {{ m.name_en }}<br>
      {% else %}
        {{ m.name }}<br>
      {% endif %}
      {% if page.lang == 'en' and m.role_en %}
        <span class="member-role">{{ m.role_en }}</span>
      {% elsif m.role %}
        <span class="member-role">{{ m.role }}</span>
      {% endif %}
    </h3>
    {% if page.lang == "en" and m.comment_en %}
      <p>{{ m.comment_en }}</p>
    {% else %}
      <p>{{ m.comment }}</p>
    {% endif %}
    {% if page.lang == "en" and m.link_en %}
      <a href="{{ m.link_en }}" class="btn-quest" target="_blank" rel="noopener">Visit</a>
    {% elsif m.link %}
      <a href="{{ m.link }}" class="btn-quest" target="_blank" rel="noopener">Visit</a>
    {% endif %}
  </div>
  {% endfor %}
</div>