---
title: Publications 
lang: ja
layout: default
nav_order: 4     # ナビの並び順。お好みで
permalink: /links.html
slug: links
slug_en: links
---

<style>
.pub-list li {
  margin-bottom: 1.2em;
  line-height: 1.6;
}
.pub-year {
  margin-top: 2em;
}
</style>

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter IV :: LINKS ::">
    <em>:: REFERENCE ::</em>
  </h1>
</section>

<section class="publications" data-reveal>
  <h2 class="chapter" data-shadow="Publications">
    <span>
      {% if page.lang == "en" %}
        Publications
      {% else %}
        研究成果
      {% endif %}
    </span>
  </h2>

  {% assign pubs = site.data.publications | sort: "year" | reverse %}
  {% assign groups = pubs | group_by: "year" %}

  {% for g in groups %}
    <h3 class="pub-year">{{ g.name }}</h3>
    <ul class="pub-list">
    {% for pub in g.items %}
      <li>
        {% if pub.link %}
          <strong class="pub-title"><a href="{{ pub.link }}" target="_blank" rel="noopener">{{ pub.title }}</a></strong><br/>
        {% else %}
          <strong class="pub-title">{{ pub.title }}</strong><br/>
        {% endif %}
        <span class="pub-authors">{{ pub.authors }}</span><br/>
        <em class="pub-venue">{{ pub.publication }}</em>
      </li>
    {% endfor %}
    </ul>
  {% endfor %}
</section>

<section class="related-orgs" data-reveal>
  <h2 class="chapter" data-shadow="Related Labs & Organizations">
    <span>
      {% if page.lang == "en" %}
        Related Labs & Organizations
      {% else %}
        関連機関・プロジェクト
      {% endif %}
    </span>
  </h2>
  <ul class="org-list">
    <li><a href="https://www.kmd.keio.ac.jp/" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        RIKEN Center for Quantum Computing
      {% else %}
        慶應義塾大学メディアデザイン研究科
      {% endif %}
    </a></li>
    <li><a href="https://www.jst.go.jp/moonshot/program/goal6/6C_nagayama.html" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        The University of Tokyo Quantum Information Technology Project
      {% else %}
        ムーンショット目標6 スケーラブルで強靭な統合的量子通信システム
      {% endif %}
    </a></li>
    <li><a href="https://qitf.org/" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        Keio University Quantum Computing Research
      {% else %}
        QUANTUM INTERNET TASK FORCE
      {% endif %}
    </a></li>
    <!-- 必要に応じて追加 -->
  </ul>
</section>

<section class="recommended-links" data-reveal>
  <h2 class="chapter" data-shadow="Recommended Quantum & Future Links">
    <span>
      {% if page.lang == "en" %}
        Recommended Quantum & Future Links
      {% else %}
        おすすめ量子・未来関連リンク集
      {% endif %}
    </span>
  </h2>
<ul class="link-list">
  <li>
    <a href="https://q-portal.riken.jp/poster-quantum/" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        "Quantum Technology Poster for Every Home" (RIKEN Q‑PORTAL)
      {% else %}
        一家に1枚 量子技術ポスター（理化学研究所Q‑PORTAL）
      {% endif %}
    </a>
  </li>
  <li>
    <a href="https://youtu.be/9Ef8ZId58WY?si=vsv0n-jMd4pRGDGW" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        Hikaru Utada "Electricity" (Music Video)
      {% else %}
        宇多田ヒカル『Electricity』（ミュージックビデオ）
      {% endif %}
    </a>
  </li>
  <li>
    <a href="https://www.nhk.jp/p/special/ts/2NY2QQLPM3/episode/te/BX6PWY3N59/" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        NHK Special "Quantum Entanglement: Einstein's Ultimate Riddle" (2024)
      {% else %}
        NHKスペシャル「量子もつれ アインシュタイン 最後の謎」（2024年放送）
      {% endif %}
    </a>
  </li>
  <li>
    <a href="https://bnn.co.jp/products/9784802511964" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        Hisato Ogata, "Convivial Technology — Designing a Society Where Humans and Technology Coexist" (BNN, 2022)
      {% else %}
        緒方壽人『コンヴィヴィアル・テクノロジー — 人間とテクノロジーが共に生きる社会へ』（BNN, 2022年）
      {% endif %}
    </a>
  </li>
  <li>
    <a href="https://book.cm-marketing.jp/books/9784295410065/" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        Akihito Inoue, "Designing Worldviews: Techniques for Imagining Future Societies" (Shoeisha, 2021)
      {% else %}
        井上明人『世界観のデザイン　未来社会を思索する技術』（翔泳社, 2021年）
      {% endif %}
    </a>
  </li>
  <li>
    <a href="https://www.amazon.co.jp/dp/4088727754" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        Osamu Tezuka, "The Glass Brain" (Jump Comics)
      {% else %}
        手塚治虫『ガラスの脳』（ジャンプコミックス）
      {% endif %}
    </a>
  </li>
  <li>
    <a href="https://www.imdb.com/title/tt0212720/" target="_blank" rel="noopener">
      {% if page.lang == "en" %}
        Steven Spielberg (Director) "A.I. Artificial Intelligence" (Warner Bros., 2001)
      {% else %}
        Steven Spielberg (監督) "A.I. Artificial Intelligence"（Warner Bros., 2001）
      {% endif %}
    </a>
  </li>
</ul>
</section>