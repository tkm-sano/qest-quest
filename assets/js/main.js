// --- Quantum Particles 背景 ---
function createQuantumParticles(){
  const NUM=40;
  const wrap=document.createElement("div");
  wrap.className="quantum-particles";
  document.body.appendChild(wrap);
  for(let i=0;i<NUM;i++){
    const p=document.createElement("div");
    p.className="quantum-particle";
    p.style.left=Math.random()*100+"vw";
    p.style.top=Math.random()*100+"vh";
    p.style.width=p.style.height=(6+Math.random()*12)+"px";
    p.style.background=`rgba(70,221,255,${.08+.18*Math.random()})`;
    p.style.animationDuration=2+Math.random()*6+"s";
    wrap.appendChild(p);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // 量子パーティクルを全ページで描画
  createQuantumParticles();

  // --- ナビゲーション ハンバーガー/開閉 ---
  const toggle = document.querySelector(".nav-toggle");
  const navMenuUl = document.getElementById("nav-list");

  // メニューを開く
  function openMenu() {
    navMenuUl.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    // document.body.style.overflow = "hidden"; // スクロールロックを無効化
  }

  // メニューを閉じる
  function closeMenu() {
    navMenuUl.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    // document.body.style.overflow = ""; // スクロール復帰を無効化
  }

  if (toggle && navMenuUl) {
    // ハンバーガークリックでトグル
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (navMenuUl.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // メニュー内リンククリックで閉じる
    navMenuUl.addEventListener("click", function (e) {
      if (e.target.tagName.toLowerCase() === "a") {
        closeMenu();
      }
    });

    // メニュー外クリックで閉じる
    document.addEventListener("click", function (e) {
      if (
        navMenuUl.classList.contains("open") &&
        !navMenuUl.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Escキーで閉じる
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenuUl.classList.contains("open")) {
        closeMenu();
      }
    });
  }
});