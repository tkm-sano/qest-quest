// assets/js/glossary-auto.js
document.addEventListener('DOMContentLoaded', () => {
  fetch('/assets/data/glossary.json')           // ← YAML を JSON 化して置く
    .then(r => r.json()).then(dict => {
      document.querySelectorAll('[data-term]').forEach(el => {
        const key = el.dataset.term;
        if (dict[key]) el.dataset.def = dict[key];
      });
    });
});