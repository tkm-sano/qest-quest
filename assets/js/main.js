document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const navMenuUl = document.querySelector(".nav-menu ul");

  if (toggle && navMenuUl) {
    toggle.addEventListener("click", function () {
      navMenuUl.classList.toggle("open");
      toggle.setAttribute(
        "aria-expanded",
        navMenuUl.classList.contains("open") ? "true" : "false"
      );

  // 開く・閉じる
  function openMenu() {
    navMenuUl.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    // スクロールロック（任意）
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    navMenuUl.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (toggle && navMenuUl) {
    // ボタンクリックでトグル
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (navMenuUl.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // メニュー内リンククリックで自動的に閉じる
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

    // Esc キーで閉じる
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenuUl.classList.contains("open")) {
        closeMenu();
      }
    });
  }
});