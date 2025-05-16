/* ─ Quantum Particles 背景 ─ */
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
document.addEventListener("DOMContentLoaded",createQuantumParticles);

/* ─ 1. IntersectionObserver でフェード */
document.addEventListener("DOMContentLoaded",()=>{
  const io=new IntersectionObserver((es)=>{
    es.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },{threshold:.2});
  document.querySelectorAll("[data-reveal]").forEach(el=>io.observe(el));
});

/* ─ 2. ボタン hover 位置に合わせて量子ラインを動かす */
document.addEventListener("mousemove",e=>{
  const btn=e.target.closest('.btn-quest');
  if(!btn) return;
  const {left,width}=btn.getBoundingClientRect();
  const x=((e.clientX-left)/width*100).toFixed(2);
  btn.style.setProperty('--hover-x',`${x}%`);
});

// 粒子アニメ用スタイルを追加
const st = document.createElement("style");
st.textContent=`
.quantum-particles{
  position:fixed;inset:0;z-index:0;pointer-events:none;
}
.quantum-particle{
  position:absolute;border-radius:50%;
  animation:qpMove linear infinite alternate;
}
@keyframes qpMove{
  0%{transform:translateY(0) scale(1);}
  100%{transform:translateY(-40vh) scale(1.4);}
}
.hero, .quantum-demo, .lead, .chapter, .caption{
  position:relative;z-index:2;
  text-align:center;
}
`;
document.head.appendChild(st);

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav-list');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      // アクセシビリティ
      toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? "true" : "false");
    });
  }
});