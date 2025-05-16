---
title: Links   # ページごとに変更
layout: default
nav_order: 4     # ナビの並び順。お好みで
---

<section class="hero" data-reveal>
  <h1 class="chapter glitch" data-shadow="Chapter IV :: LINKS ::">
    <span>Chapter&nbsp;IV</span><em>:: LINKS ::</em>
  </h1>
</section>

<section class="related-orgs" data-reveal>
  <h2 class="chapter" data-shadow="Related Labs & Organizations">
    <span>
      {% if lang == "en" %}
        Related Labs & Organizations
      {% else %}
        関連機関・プロジェクト
      {% endif %}
    </span>
  </h2>
  <ul class="org-list">
    <li><a href="https://www.kmd.keio.ac.jp/" target="_blank">
      {% if lang == "en" %}
        RIKEN Center for Quantum Computing
      {% else %}
        慶應義塾大学メディアデザイン研究科
      {% endif %}
    </a></li>
    <li><a href="https://www.jst.go.jp/moonshot/program/goal6/6C_nagayama.html" target="_blank">
      {% if lang == "en" %}
        The University of Tokyo Quantum Information Technology Project
      {% else %}
        ムーンショット目標6 スケーラブルで強靭な統合的量子通信システム
      {% endif %}
    </a></li>
    <li><a href="https://qitf.org/" target="_blank">
      {% if lang == "en" %}
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
      {% if lang == "en" %}
        Recommended Quantum & Future Links
      {% else %}
        おすすめ量子・未来関連リンク集
      {% endif %}
    </span>
  </h2>
  <ul class="link-list">
    <li><a href="https://quantum.country" target="_blank">Quantum Country</a></li>
    <li><a href="https://qiskit.org" target="_blank">Qiskit</a></li>
    <li><a href="https://quantum-journal.org" target="_blank">Quantum-Journal</a></li>
    <!-- 他にも追加可能 -->
  </ul>
</section>