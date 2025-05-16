document.addEventListener("DOMContentLoaded", function () {
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