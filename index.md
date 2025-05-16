---
title: Vision
layout: default
nav_order: 1
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter I :: VISION ::">
    <span>Chapter&nbsp;I</span><em>:: VISION ::</em>
  </h1>
  {% if lang == "en" %}
    <p class="lead">Designing and realizing the near-future IT paradigm with Quantum Internet</p>
    <a class="btn-quest" href="/projects/?lang={{ lang }}">Let's embark on a quest →</a>
  {% else %}
    <p class="lead">量子インターネットによる近未来ITパラダイムの社会デザインと実現</p>
  {% endif %}
</section>

<section class="quantum-demo" data-reveal>
  {% if lang == "en" %}
    <h2>What is a Quantum Computer?</h2>
    <p class="caption">Experience quantum states through the superposition of color and sound.</p>
    <div class="video-container" data-reveal>
      <video controls
             src="{{ '/assets/video/quantum_intro.mp4' | relative_url }}"
             class="quantum-video"></video>
      <p class="video-description">
        Quantum Superposition Demo&nbsp;&mdash;&nbsp;visualising how a qubit can be 0 and 1 at the same time.
      </p>
    </div>
  {% else %}
    <h2>量子コンピュータとは？</h2>
    <p class="caption">量子状態を体感しよう</p>
    <div class="video-container" data-reveal>
      <video controls
             src="{{ '/assets/video/quantum_intro.mp4' | relative_url }}"
             class="quantum-video"></video>
      <p class="video-description">
        量子ビットが 0 と 1 を同時に取る&nbsp;―&nbsp;重ね合わせ状態を視覚化したデモ。
      </p>
    </div>
  {% endif %}
</section>

<section class="quest-contact" data-reveal>
  <h2 class="chapter">Contact</h2>
  {% if lang == "en" %}
    <p>Please contact us using the form below.</p>
    <ul class="contact-list">
      <li>KMD: 4-1-1 Hiyoshi, Kohoku-ku, Yokohama, Kanagawa</li>
      <li>Q/EST: 7-7 Shinkawasaki, Saiwai-ku, Kawasaki, Kanagawa</li>
    </ul>
    <div style="text-align:center; margin: 2em 0;">
      <a href="https://forms.gle/WhzwMF4iz6G1PrDf9"
         target="_blank" rel="noopener"
         class="btn get-in-touch"
         style="padding:0.8em 1.6em;
                background:#0050ff;
                color:#ffffff;
                font-size:1.2em;
                border-radius:8px;
                text-decoration:none;
                display:inline-block;">
        Contact&nbsp;Us
      </a>
    </div>
  {% else %}
    <p>ご連絡は下記フォームからどうぞ。</p>
    <ul class="contact-list">
      <li>KMD：横浜市港北区日吉 4-1-1 慶應義塾大学日吉協生館</li>
      <li>Q/est：神奈川県川崎市幸区新川崎7-7 かわさき新産業創造センター</li>
    </ul>
    <div style="text-align:center; margin: 2em 0;">
      <a href="https://forms.gle/WhzwMF4iz6G1PrDf9"
         target="_blank" rel="noopener"
         class="btn get-in-touch"
         style="padding:0.8em 1.6em;
                background:#0050ff;
                color:#ffffff;
                font-size:1.2em;
                border-radius:8px;
                text-decoration:none;
                display:inline-block;">
        Contact&nbsp;Us
      </a>
    </div>
  {% endif %}
</section>