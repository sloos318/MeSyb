/* ===== app.js — optimized, same visuals ===== */

/* -------------------------------
   1) GRID + PARALLAX (3D vloer)
--------------------------------- */

// Config
const N = 15;

// Cache DOM
const grid = document.querySelector(".grid");
const floor = document.querySelector(".floor");
const main = document.querySelector("main");
const checkbox = document.querySelector('input[name="thingy"]');

// Veiligheidschecks
if (grid) {
  grid.style.setProperty("--n", N);

  // Maak cubes via fragment (sneller dan telkens appenden)
  const m = N * N;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < m; i++) {
    const cube = document.createElement("div");
    cube.className = "cube";
    frag.appendChild(cube);
  }
  grid.appendChild(frag);

  // Zet i/j/chess als CSS custom properties
  const cubes = grid.querySelectorAll(".cube");
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const idx = i * N + j;
      const cube = cubes[idx];
      cube.style.setProperty("--i", i);
      cube.style.setProperty("--j", j);
      cube.style.setProperty("--chess", (i + j) % 2);
    }
  }
}

// Parallax state
let mouseX = 0,
  mouseY = 0;
let targetX = 0,
  targetY = 0;
let velocityX = 0,
  velocityY = 0;
let parallaxActive = false;

// Tuning
const stiffness = 0.05; // responsiviteit
const damping = 0.12; // demping

// Debounced resize (geen full reload meer)
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Nu niets nodig voor de grid (layout is fluid),
    // maar hier kun je in de toekomst recalculaties doen.
    // grid.style.setProperty('--n', N);
  }, 150);
});

// Mouse tracking -> target richting
document.addEventListener("mousemove", (e) => {
  if (!parallaxActive) return;
  const { innerWidth, innerHeight } = window;
  targetX = (e.clientX / innerWidth - 0.5) * 2;
  targetY = (e.clientY / innerHeight - 0.5) * 2;
});

// Delta-timing voor stabiele animatie
let lastTime = 0;
function animateParallax(ts) {
  if (!lastTime) lastTime = ts;
  const delta = (ts - lastTime) / 16.67; // normaliseer naar 60fps
  lastTime = ts;

  if (parallaxActive && grid && floor) {
    const ax = (targetX - mouseX) * stiffness * delta;
    const ay = (targetY - mouseY) * stiffness * delta;

    velocityX = velocityX * (1 - damping) + ax;
    velocityY = velocityY * (1 - damping) + ay;

    mouseX += velocityX;
    mouseY += velocityY;

    const rotX = 65 + mouseY * 2.5;
    const rotZ = 45 + mouseX * 2.5;

    const transform = `rotateX(${rotX}deg) rotate(${rotZ}deg) scale(.2)`;
    grid.style.transform = transform;
    floor.style.transform = `translateY(7.2vw) ${transform}`;
  }

  requestAnimationFrame(animateParallax);
}
requestAnimationFrame(animateParallax);

// Checkbox toggle
if (checkbox && grid && floor && main) {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      grid.style.transition = floor.style.transition =
        "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
      const scaled = "rotateX(65deg) rotate(45deg) scale(.2)";
      grid.style.transform = scaled;
      floor.style.transform = `translateY(7.2vw) ${scaled}`;

      const startParallax = () => {
        parallaxActive = true;
        grid.removeEventListener("transitionend", startParallax);
      };
      grid.addEventListener("transitionend", startParallax);
    } else {
      parallaxActive = false;
      grid.style.transition = floor.style.transition = "transform 0.4s ease";
      grid.style.transform = "rotateX(55deg) rotate(45deg)";
      floor.style.transform =
        "translateY(7.2vw) rotateX(65deg) rotate(45deg) scale(.2)";
      main.style.perspectiveOrigin = "50% 50%";
    }
  });
}

/* --------------------------------
   2) FLOATING SVGS (achtergrond)
----------------------------------- */

(() => {
  const total = 10;
  const wrap = document.getElementById("wrap");
  if (!wrap) return;

  const svgPath = `
    <path d="m2.46,126.39c10.12,-0.06 20.25,-0.13 30.38,-0.2
    c0.07,-10.4 0.13,-20.8 0.2,-31.2c10.08,0 20.16,0 30.23,0
    c0,-10.46 0,-20.93 0,-31.39c10.34,0 20.67,0 31.01,0
    c0,-10.21 0,-20.42 0,-30.62c10.21,0 20.42,0 30.62,0
    c0,-10.21 0,-20.42 0,-30.62c15.18,0 30.37,0 45.55,0
    c0,5.1 0,10.21 0,15.31c-10.08,0 -20.16,0 -30.24,0
    c0,10.34 0,20.67 0,31.01c-10.21,0 -20.42,0 -30.62,0
    c0,10.34 0,20.67 0,31.01c-10.21,0 -20.42,0 -30.62,0
    c0,10.34 0,20.67 0,31.01c-10.34,0 -20.67,0 -31.01,0
    c0,10.46 0,20.93 0,31.39c-15.31,0 -30.62,0 -45.94,0
    c0.68,-5.07 -1.16,-10.79 0.44,-15.69z"
    stroke-width="7" fill="none"/>
  `;

  const styleTag = document.createElement("style");
  const frag = document.createDocumentFragment();
  let keyframeBuffer = "";

  for (let i = 1; i <= total; i++) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("svg");
    svg.innerHTML = svgPath;

    const left = Math.random() * 120 - 20;
    const scale = 0.3 * i - 0.6;
    const rotation = Math.fround(Math.random() * 360);
    const duration = 6 + Math.random() * 15;
    const delay = Math.random() * 5 - 5;
    const blur = i - 6;
    const zIndex = i - 7;

    Object.assign(svg.style, {
      left: `${left}%`,
      zIndex,
      filter: `blur(${blur}px)`,
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      animation: `raise${i} ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
    });

    keyframeBuffer += `
      @keyframes raise${i} {
        to {
          bottom: 150vh;
          transform: scale(${scale}) rotate(${Math.fround(Math.random() * 360)}deg);
        }
      }
    `;

    frag.appendChild(svg);
  }

  styleTag.textContent = keyframeBuffer;
  document.head.appendChild(styleTag);
  wrap.appendChild(frag);
})();

/* -----------------------------
   3) STARFIELD CANVAS (sterren)
------------------------------- */

(() => {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  const DPR = window.devicePixelRatio || 1;

  // Settings (identieke visuals)
  const particleCount = 25;
  const flareCount = 10;
  const motion = 0.05;
  const color = "#FFEED4";
  const particleSizeBase = 1;
  const particleSizeMultiplier = 0.5;
  const flareSizeBase = 100;
  const flareSizeMultiplier = 100;
  const glareAngle = -60 * (Math.PI / 180);
  const glareOpacityMultiplier = 0.05;
  const flicker = true;
  const flickerSmoothing = 15;
  const noiseLength = 1000;
  const nAngle = (Math.PI * 2) / noiseLength;
  const nRad = 100;

  const mouse = { x: 0, y: 0 };
  let n = 0;
  let nPos = { x: 0, y: 0 };

  // Pre-render star sprite (offscreen) voor performance
  const STAR_CACHE_SIZE = 64; // basis; wordt geschaald per draw
  const starCache = document.createElement("canvas");
  starCache.width = STAR_CACHE_SIZE;
  starCache.height = STAR_CACHE_SIZE;
  const sctx = starCache.getContext("2d");
  sctx.fillStyle = color;
  sctx.beginPath();
  sctx.arc(STAR_CACHE_SIZE / 2, STAR_CACHE_SIZE / 2, STAR_CACHE_SIZE / 2, 0, Math.PI * 2);
  sctx.fill();

  // Canvas setup + resize
  function resize() {
    const { innerWidth, innerHeight } = window;
    canvas.width = Math.max(1, innerWidth * DPR);
    canvas.height = Math.max(1, innerHeight * DPR);
    // Zorgt dat we niet cumulatief schalen
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Helpers
  const random = (min, max, float = false) =>
    float
      ? Math.random() * (max - min) + min
      : Math.floor(Math.random() * (max - min + 1)) + min;

  const sizeRatio = () => Math.max(canvas.width, canvas.height) / DPR;

  const noisePoint = (i) => {
    const a = nAngle * i;
    return { x: nRad * Math.cos(a), y: nRad * Math.sin(a) };
  };

  const position = (x, y, z) => ({
    x: x * canvas.width / DPR + ((canvas.width / (2 * DPR) - mouse.x + nPos.x) * z * motion),
    y: y * canvas.height / DPR + ((canvas.height / (2 * DPR) - mouse.y + nPos.y) * z * motion),
  });

  // Classes
  function Particle() {
    this.x = random(-0.1, 1.1, true);
    this.y = random(-0.1, 1.1, true);
    this.z = random(0, 4);
    this.opacity = random(0.1, 1, true);
    this.flicker = 0;
  }
  Particle.prototype.render = function () {
    const pos = position(this.x, this.y, this.z);
    const r = ((this.z * particleSizeMultiplier) + particleSizeBase) * (sizeRatio() / 1000);
    let o = this.opacity;

    if (flicker) {
      const newVal = random(-0.5, 0.5, true);
      this.flicker += (newVal - this.flicker) / flickerSmoothing;
      o = Math.max(0, Math.min(1, o + this.flicker));
    }

    // Ster (sprite) tekenen
    ctx.globalAlpha = o;
    ctx.drawImage(starCache, pos.x - r, pos.y - r, r * 2, r * 2);

    // Glare
    ctx.globalAlpha = o * glareOpacityMultiplier;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, r * 100, r, glareAngle, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.globalAlpha = 1;
  };

  function Flare() {
    this.x = random(-0.25, 1.25, true);
    this.y = random(-0.25, 1.25, true);
    this.z = random(0, 2);
    this.opacity = random(0.001, 0.01, true);
  }
  Flare.prototype.render = function () {
    const pos = position(this.x, this.y, this.z);
    const r = ((this.z * flareSizeMultiplier) + flareSizeBase) * (sizeRatio() / 1000);
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Input
  document.body.addEventListener(
    "mousemove",
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true }
  );

  // Setup
  const particles = Array.from({ length: particleCount }, () => new Particle());
  const flares = Array.from({ length: flareCount }, () => new Flare());

  // Render loop
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    n = (n + 1) % noiseLength;
    nPos = noisePoint(n);

    // particles
    for (let i = 0; i < particles.length; i++) particles[i].render();
    // flares
    for (let i = 0; i < flares.length; i++) flares[i].render();

    requestAnimationFrame(render);
  }
  render();

  // Batterij/CPU vriendelijk bij tab switch (optioneel maar slim)
  document.addEventListener("visibilitychange", () => {
    // Je kunt hier eventueel timers pauzeren; rAF stopt meestal zelf al
  });
})();
