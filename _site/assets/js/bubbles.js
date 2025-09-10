const canvas = document.getElementById("quantum-bubbles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let bubbles = [];
  const colors = ["#a3d8f4"];

  class Bubble {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.r = Math.random() * 4 + 2;
      this.dx = (Math.random() - 0.5) * 0.4;
      this.dy = (Math.random() - 0.5) * 0.4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.5 + 0.5;
      // Add phase for twinkling
      this.phase = Math.random() * Math.PI * 2;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      // Quantum twinkle
      const twinkle = 0.3 * Math.sin(Date.now() * 0.002 + this.phase) + this.opacity;
      ctx.globalAlpha = Math.max(0, Math.min(1, twinkle));
      ctx.fill();
      /*
      // Subtle quantum glow stroke
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
      */
      ctx.globalAlpha = 1.0;
      ctx.closePath();
    }
    update() {
      this.x += this.dx;
      this.y += this.dy;
      if (this.x + this.r > canvas.width || this.x - this.r < 0) this.dx *= -1;
      if (this.y + this.r > canvas.height || this.y - this.r < 0) this.dy *= -1;
      this.draw();
    }
  }

  for (let i = 0; i < 50; i++) {
    bubbles.push(new Bubble());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(b => b.update());
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}