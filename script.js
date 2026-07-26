// main.js
// Custom particle attraction system. No dependencies. Pure math.

const canvas = document.getElementById("fluid-matrix");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];
let mouse = { x: -1000, y: -1000 };
const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 150;
const MOUSE_RADIUS = 200;

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 1.5 + 0.5;
    this.baseAlpha = Math.random() * 0.5 + 0.2;
  }

  update() {
    // Mouse attraction/repulsion
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_RADIUS) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      const angle = Math.atan2(dy, dx);
      // Gentle attraction
      this.vx += Math.cos(angle) * force * 0.02;
      this.vy += Math.sin(angle) * force * 0.02;
    }

    // Damping
    this.vx *= 0.98;
    this.vy *= 0.98;

    this.x += this.vx;
    this.y += this.vy;

    // Boundary wrapping
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${this.baseAlpha})`;
    ctx.fill();
  }
}

function initCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONNECTION_DISTANCE) {
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  drawConnections();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", initCanvas);
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("mouseout", () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

// UI Interactions
const authDialog = document.getElementById("auth-dialog");
const authTrigger = document.querySelector(".auth-trigger");
const initBtn = document.getElementById("initiate-sequence");

authTrigger.addEventListener("click", () => authDialog.showModal());
initBtn.addEventListener("click", () => authDialog.showModal());

// Mock data rendering
const assets = [
  {
    ticker: "AURA-X",
    name: "Obsidian Yield Fund",
    status: "Active",
    allocation: "42%",
    performance: "+18.4%"
  },
  {
    ticker: "VRTX",
    name: "Venture Credit Line",
    status: "Active",
    allocation: "28%",
    performance: "+12.1%"
  },
  {
    ticker: "EQ-GLB",
    name: "Global Equity Tranche",
    status: "Active",
    allocation: "20%",
    performance: "+9.8%"
  },
  {
    ticker: "FI-PRV",
    name: "Private Credit Vault",
    status: "Locked",
    allocation: "10%",
    performance: "+22.5%"
  }
];

const gridContainer = document.getElementById("asset-grid-container");
const template = document.getElementById("asset-card-template");

assets.forEach((asset) => {
  const clone = template.content.cloneNode(true);
  clone.querySelector(".asset-ticker").textContent = asset.ticker;
  clone.querySelector(".asset-name").textContent = asset.name;
  clone.querySelector(".asset-status").textContent = asset.status;
  clone.querySelector(".asset-allocation").textContent =
    `Allocation: ${asset.allocation}`;
  clone.querySelector(".asset-performance").textContent = asset.performance;
  gridContainer.appendChild(clone);
});

// Metric animation
function animateValue(id, start, end, duration, prefix = "", suffix = "") {
  const obj = document.getElementById(id);
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = start + progress * (end - start);
    obj.textContent = `${prefix}${current.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

window.addEventListener("load", () => {
  animateValue("tvl-value", 0, 842.5, 2000, "$", "M");
  animateValue("yield-value", 0, 14.2, 2000, "", "%");
});

initCanvas();
animate();
