---
title: Contact          # ページタイトル
layout: default
nav_order: 5            # ナビゲーションの並び順
---


<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter V :: CONTACT ::">
    <span>Chapter&nbsp;V</span><em>:: CONTACT ::</em>
  </h1>
  {% if lang == "en" %}
    <p class="lead" style="font-size:1.8em;">Contact Q/est</p>
  {% else %}
    <p class="lead" style="font-size:1.8em;">Q/estへのお問い合わせ</p>
  {% endif %}
  <div style="text-align:center; margin:1em 0;">
    <a href="https://forms.gle/WhzwMF4iz6G1PrDf9" target="_blank" rel="noopener" class="btn get-in-touch" style="padding:0.8em 1.6em; background:#0050ff; color:#ffffff; font-size:1.2em; border-radius:8px; text-decoration:none; display:inline-block;">
      {% if lang == "en" %}Get in touch{% else %}<em>Let's embark on a quest with us!</em>{% endif %}
    </a>
  </div>
</section>

<section class="contact-description" data-reveal>
  {% if lang == "en" %}
    <p>
      For inquiries regarding collaboration, coverage, or projects, please use the form below.<br>
      Personal information entered in this inquiry form will be managed appropriately with due consideration for privacy.<br>
      Personal information will not be provided to a third party without the consent of the individual.
    </p>
  {% else %}
    <p>
      協業や取材、プロジェクトに関するお問い合わせは、以下のフォームからご連絡ください。<br>
      このお問合せフォームにご記入いただきました個人情報は、十分プライバシーに配慮し、適正に管理を行います。<br>
      個人情報は、ご本人の承諾なしに第三者に提供することはありません。
    </p>
  {% endif %}
</section>

<ul class="contact-list">
  {% if lang == "en" %}
    <li>KMD: 4-1-1 Hiyoshi, Kohoku-ku, Yokohama, Kanagawa</li>
    <li>Q/EST: 7-7 Shinkawasaki, Saiwai-ku, Kawasaki, Kanagawa</li>
  {% else %}
    <li>KMD：横浜市港北区日吉 4-1-1 慶應義塾大学日吉協生館</li>
    <li>Q/EST：神奈川県川崎市幸区新川崎7-7 かわさき新産業創造センター</li>
  {% endif %}
</ul>