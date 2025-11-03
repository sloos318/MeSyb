// /* background.js — optimized version, identical visuals but better performance */
// (() => {
//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", main);
//   } else {
//     main();
//   }

//   function main() {
//     // === FLOATING SVGS ===
//     const total = 10;
//     const wrap = document.getElementById("wrap");
//     const svgPath = `
//       <path d="m2.46,126.39c10.12,-0.06 20.25,-0.13 30.38,-0.2
//       c0.07,-10.4 0.13,-20.8 0.2,-31.2c10.08,0 20.16,0 30.23,0
//       c0,-10.46 0,-20.93 0,-31.39c10.34,0 20.67,0 31.01,0
//       c0,-10.21 0,-20.42 0,-30.62c10.21,0 20.42,0 30.62,0
//       c0,-10.21 0,-20.42 0,-30.62c15.18,0 30.37,0 45.55,0
//       c0,5.1 0,10.21 0,15.31c-10.08,0 -20.16,0 -30.24,0
//       c0,10.34 0,20.67 0,31.01c-10.21,0 -20.42,0 -30.62,0
//       c0,10.34 0,20.67 0,31.01c-10.21,0 -20.42,0 -30.62,0
//       c0,10.34 0,20.67 0,31.01c-10.34,0 -20.67,0 -31.01,0
//       c0,10.46 0,20.93 0,31.39c-15.31,0 -30.62,0 -45.94,0
//       c0.68,-5.07 -1.16,-10.79 0.44,-15.69z"
//       stroke-width="7" fill="none"/>
//     `;

//     if (wrap) {
//       const styleTag = document.createElement("style");
//       const svgFragment = document.createDocumentFragment();

//       for (let i = 1; i <= total; i++) {
//         const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//         svg.classList.add("svg");
//         svg.innerHTML = svgPath;

//         const left = Math.random() * 120 - 20;
//         const scale = 0.3 * i - 0.6;
//         const rotation = Math.random() * 360;
//         const duration = 6 + Math.random() * 15;
//         const delay = Math.random() * 5 - 5;
//         const blur = i - 6;
//         const zIndex = i - 7;

//         Object.assign(svg.style, {
//           left: `${left}%`,
//           zIndex,
//           filter: `blur(${blur}px)`,
//           transform: `scale(${scale}) rotate(${rotation}deg)`,
//           animation: `raise${i} ${duration}s linear infinite`,
//           animationDelay: `${delay}s`,
//         });

//         // Collect all keyframes into one string (more efficient)
//         styleTag.textContent += `
//           @keyframes raise${i} {
//             to {
//               bottom: 150vh;
//               transform: scale(${scale}) rotate(${Math.random() * 360}deg);
//             }
//           }
//         `;

//         svgFragment.appendChild(svg);
//       }

//       document.head.appendChild(styleTag);
//       wrap.appendChild(svgFragment);
//     }

//     // === STARFIELD ===
//     const canvas = document.getElementById("stars");
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     const DPR = window.devicePixelRatio || 1;

//     let particleCount = 40,
//       flareCount = 10,
//       motion = 0.05,
//       color = "#FFEED4",
//       particleSizeBase = 1,
//       particleSizeMultiplier = 0.5,
//       flareSizeBase = 100,
//       flareSizeMultiplier = 100,
//       lineWidth = 1,
//       linkChance = 75,
//       linkLengthMin = 5,
//       linkLengthMax = 7,
//       linkOpacity = 0.25,
//       linkFade = 90,
//       linkSpeed = 1,
//       glareAngle = -60,
//       glareOpacityMultiplier = 0.05,
//       renderParticles = true,
//       renderParticleGlare = true,
//       renderFlares = true,
//       renderLinks = true,
//       renderMesh = false,
//       flicker = true,
//       flickerSmoothing = 15,
//       noiseLength = 1000,
//       noiseStrength = 1;

//     const c = 1000;
//     let n = 0;
//     const nAngle = (Math.PI * 2) / noiseLength;
//     const nRad = 100;
//     const particles = [];
//     const flares = [];
//     const links = [];
//     const mouse = { x: 0, y: 0 };
//     let nPos = { x: 0, y: 0 };
//     let vertices = [];
//     const triangles = [];

//     // Init canvas once
//     function resize() {
//       const { innerWidth, innerHeight } = window;
//       canvas.width = innerWidth * DPR;
//       canvas.height = innerHeight * DPR;
//       ctx.scale(DPR, DPR);
//     }
//     window.addEventListener("resize", resize);
//     resize();

//     // --- Particle Class ---
//     function Particle() {
//       this.x = random(-0.1, 1.1, true);
//       this.y = random(-0.1, 1.1, true);
//       this.z = random(0, 4);
//       this.opacity = random(0.1, 1, true);
//       this.flicker = 0;
//       this.neighbors = [];
//     }
//     Particle.prototype.render = function () {
//       const pos = position(this.x, this.y, this.z);
//       const r = ((this.z * particleSizeMultiplier) + particleSizeBase) * (sizeRatio() / 1000);
//       let o = this.opacity;

//       if (flicker) {
//         const newVal = random(-0.5, 0.5, true);
//         this.flicker += (newVal - this.flicker) / flickerSmoothing;
//         o = Math.max(0, Math.min(1, o + this.flicker));
//       }

//       ctx.fillStyle = color;
//       ctx.globalAlpha = o;
//       ctx.beginPath();
//       ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
//       ctx.fill();

//       if (renderParticleGlare) {
//         ctx.globalAlpha = o * glareOpacityMultiplier;
//         ctx.ellipse(pos.x, pos.y, r * 100, r, glareAngle * (Math.PI / 180), 0, 2 * Math.PI);
//         ctx.fill();
//       }

//       ctx.globalAlpha = 1;
//     };

//     function Flare() {
//       this.x = random(-0.25, 1.25, true);
//       this.y = random(-0.25, 1.25, true);
//       this.z = random(0, 2);
//       this.opacity = random(0.001, 0.01, true);
//     }
//     Flare.prototype.render = function () {
//       const pos = position(this.x, this.y, this.z);
//       const r = ((this.z * flareSizeMultiplier) + flareSizeBase) * (sizeRatio() / 1000);
//       ctx.globalAlpha = this.opacity;
//       ctx.beginPath();
//       ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
//       ctx.fillStyle = color;
//       ctx.fill();
//       ctx.globalAlpha = 1;
//     };

//     // --- Helpers ---
//     function random(min, max, float) {
//       return float
//         ? Math.random() * (max - min) + min
//         : Math.floor(Math.random() * (max - min + 1)) + min;
//     }

//     function position(x, y, z) {
//       return {
//         x: x * canvas.width / DPR + ((canvas.width / (2 * DPR) - mouse.x + nPos.x) * z * motion),
//         y: y * canvas.height / DPR + ((canvas.height / (2 * DPR) - mouse.y + nPos.y) * z * motion),
//       };
//     }

//     function sizeRatio() {
//       return Math.max(canvas.width, canvas.height);
//     }

//     function noisePoint(i) {
//       const a = nAngle * i;
//       return { x: nRad * Math.cos(a), y: nRad * Math.sin(a) };
//     }

//     // --- Input ---
//     document.body.addEventListener("mousemove", (e) => {
//       mouse.x = e.clientX;
//       mouse.y = e.clientY;
//     });

//     // --- Setup ---
//     for (let i = 0; i < particleCount; i++) particles.push(new Particle());
//     for (let i = 0; i < flareCount; i++) flares.push(new Flare());

//     // --- Render loop ---
//     function render() {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       n = (n + 1) % noiseLength;
//       nPos = noisePoint(n);

//       if (renderParticles) for (const p of particles) p.render();
//       if (renderFlares) for (const f of flares) f.render();

//       requestAnimationFrame(render);
//     }

//     render();
//   }
// })();
