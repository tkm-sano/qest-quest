/*  DreamSphere Live Ring visualization (p5.js)
    --------------------------------------------------
    - Five frequency bands (δ, θ, α, β, γ) are rendered
      as animated rings around a central sphere.
    - Ring radius  : instantaneous power
    - Ring rotation: relative occurrence frequency
    - Hue per band : low‑freq → cool, high‑freq → warm
    -------------------------------------------------- */

let bands = 5;          // number of frequency bands
let history = [];       // rolling buffer for potential future use

function setup() {
  createCanvas(480, 480, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  noFill();
  strokeWeight(2);
}

function draw() {
  background(0, 0, 10);           // dark backdrop
  rotateX(-PI / 6);               // slight tilt for depth
  rotateZ(frameCount * 0.002);    // slow global spin

  // --- generate (or receive) data -----------------
  let now = [];
  for (let b = 0; b < bands; b++) {
    // Placeholder: Perlin noise → 0.2‒1.0
    // Replace with real-time values via WebSocket, MIDI, etc.
    now[b] = noise(frameCount * 0.01 + b) * 0.8 + 0.2;
  }
  history.unshift(now);
  if (history.length > 120) history.pop();

  // --- central sphere -----------------------------
  push();
  noStroke();
  fill(200, 10, 100, 20);         // faint bluish glow
  sphere(40);
  pop();

  // --- animated rings -----------------------------
  for (let b = 0; b < bands; b++) {
    const baseRad = 60 + b * 14;                // baseline radius
    const amp     = now[b] * 30;                // amplitude scaling
    const hue     = map(b, 0, bands, 200, 360); // cool→warm

    stroke(hue, 80, 90, 70);

    beginShape();
    for (let a = 0; a < TWO_PI; a += PI / 60) {
      const r = baseRad + amp + sin(a * 4 + frameCount * 0.03) * now[b] * 8;
      vertex(r * cos(a), r * sin(a), 0);
    }
    endShape(CLOSE);
  }
}

// --- simple interaction helpers ------------------
function mousePressed() { noLoop(); }  // pause animation
function mouseReleased() { loop(); }   // resume
