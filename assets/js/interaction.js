/**
 * interaction.js
 * ──────────────────────────────────────────────────────────
 * 近未来 SF 小説ページ用の軽量インタラクション集
 * 依存ライブラリなし / ES‑6
 * 1) スクロール進捗バー
 * 2) 画像ライトボックス（data-full 付き img）
 * 3) 広告・LIVE ブロックの開閉
 * 4) 効果音テキスト (.sfx) フェードイン
 * 5) セクション (.scene) フェードイン
 * –––––––––––––––––––––––––––––––––––––––––––––──────────────
 */
/* ───────── 1. スクロール進捗バー ───────── */
(() => {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:4px;width:0;
    background:linear-gradient(90deg,#0ff,#66f);
    z-index:9999;transition:width .1s linear;pointer-events:none`;
  document.body.appendChild(bar);
    const onScroll = () => {
    const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
    const ratio = scrollTop / (scrollHeight - clientHeight);
    bar.style.width = (ratio * 100) + '%';
  };
  document.addEventListener('scroll', onScroll, {passive: true});
  onScroll(); // 初期化
})();

/* ───────── 2. 画像ライトボックス ───────── */
(() => {
  // 全画面オーバーレイ
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.style.cssText = `
    position:fixed;inset:0;background:#000a;display:none;
    justify-content:center;align-items:center;cursor:pointer;
    z-index:9998`;
  lb.innerHTML = '<img style="max-width:95vw;max-height:95vh">';
  document.body.appendChild(lb);

  lb.addEventListener('click', () => (lb.style.display = 'none'));

  document.addEventListener('click', e => {
    const img = e.target.closest('img[data-full]');
    if (!img) return;
    lb.querySelector('img').src = img.src;
    lb.style.display = 'flex';
  });
})();

/* ───────── 3. 広告 / LIVE ブロック開閉 ───────── */
(() => {
  const SELECTOR = 'blockquote.ad,blockquote.live,blockquote.feed,blockquote.sys';

  document.addEventListener('click', e => {
    const block = e.target.closest(SELECTOR);
    if (block) block.classList.toggle('open');
  });
})();

/* ───────── 4. 効果音テキスト (.sfx) ───────── */
(() => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.animated) return;
      el.dataset.animated = '1';

      const chars = [...el.textContent.trim()];
      el.innerHTML = chars.map(c => `<span style="opacity:0">${c}</span>`).join('');

      [...el.children].forEach((span, i) =>
        setTimeout(() => (span.style.opacity = 1), i * 40)
      );
    });
  }, {threshold: 0.2});

  document.querySelectorAll('.sfx').forEach(el => io.observe(el));
})();

/* ───────── 5. セクション・フェードイン (.scene) ───────── */
(() => {
  document.querySelectorAll('.scene').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity .6s cubic-bezier(.2,.7,.3,1),transform .6s';
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.2});

  document.querySelectorAll('.scene').forEach(el => io.observe(el));
})();
