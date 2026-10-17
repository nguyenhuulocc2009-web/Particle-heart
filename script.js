const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let w, h, dpr;
let particles = [];
let hue = 325;
let running = true;
let lastTime = 0;
let elapsed = 0;
let burstUntil = 0;

const TOTAL = 1000;
const colors = [325, 285, 190, 120, 45, 350];

function heartPoint(t, scale) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t)
    - 5 * Math.cos(2 * t)
    - 2 * Math.cos(3 * t)
    - Math.cos(4 * t);

  return {
    x: w / 2 + x * scale,
    y: h / 2 - y * scale
  };
}

function makeHeartPoint() {
  const t = Math.random() * Math.PI * 2;
  const scale = Math.min(w * 0.018, h * 0.014);
  const p = heartPoint(t, scale);
  const fill = Math.sqrt(Math.random());

  return {
    x: w / 2 + (p.x - w / 2) * fill,
    y: h / 2 + (p.y - h / 2) * fill
  };
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
}

function createParticles() {
  particles = [];

  for (let i = 0; i < TOTAL; i++) {
    const target = makeHeartPoint();

    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      tx: target.x,
      ty: target.y,
      sx: Math.random() * w,
      sy: Math.random() * h,
      size: Math.random() * 1.5 + 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.035 + Math.random() * 0.035
    });
  }
}

function smooth(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function animate(time) {
  requestAnimationFrame(animate);

  if (!lastTime) lastTime = time;
  const dt = Math.min((time - lastTime) / 16.67, 2);
  lastTime = time;

  if (!running) return;

  elapsed += dt / 60;

  ctx.fillStyle = "rgba(3,0,8,0.24)";
  ctx.fillRect(0, 0, w, h);

  const cycle = elapsed % 7;
  const gather = smooth(2.5, 4.5, cycle);
  const scatter = 1 - gather;
  const burstActive = performance.now() < burstUntil;

  for (const p of particles) {
    const wave = Math.sin(elapsed * 2 + p.phase);
    const pulse = 1 + wave * 0.018;

    let targetX = w / 2 + (p.tx - w / 2) * pulse;
    let targetY = h / 2 + (p.ty - h / 2) * pulse;

    targetX += Math.sin(elapsed + p.phase) * 2;
    targetY += Math.cos(elapsed * 1.2 + p.phase) * 2;

    const spreadX = p.sx + Math.sin(elapsed + p.phase) * 20;
    const spreadY = p.sy + Math.cos(elapsed + p.phase) * 20;

    let destX = targetX * gather + spreadX * scatter;
    let destY = targetY * gather + spreadY * scatter;

    if (burstActive) {
      const angle = p.phase + p.tx * 0.01;
      const distance = Math.max(w, h) * 0.7;

      destX += Math.cos(angle) * distance;
      destY += Math.sin(angle) * distance;
    }

    p.x += (destX - p.x) * p.speed * dt;
    p.y += (destY - p.y) * p.speed * dt;

    const alpha = 0.5 + (wave + 1) * 0.25;

    ctx.beginPath();
    ctx.fillStyle =
      `hsla(${hue + wave * 12},100%,70%,${alpha})`;
    ctx.shadowBlur = 7;
    ctx.shadowColor = `hsl(${hue},100%,60%)`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;

  if (cycle > 3.2 && !burstActive) {
    const scale = Math.min(w * 0.018, h * 0.014);
    const opacity = smooth(3.2, 4.5, cycle);

    ctx.beginPath();

    for (let i = 0; i <= 180; i++) {
      const p = heartPoint(
        (i / 180) * Math.PI * 2,
        scale
      );

      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }

    ctx.closePath();
    ctx.globalAlpha = opacity * 0.65;
    ctx.strokeStyle = `hsl(${hue},100%,70%)`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 22;
    ctx.shadowColor = `hsl(${hue},100%,60%)`;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

document.getElementById("toggle").onclick = function() {
  running = !running;
  this.textContent = running ? "TẠM DỪNG" : "TIẾP TỤC";
};

document.getElementById("color").onclick = function() {
  const index = colors.indexOf(hue);
  hue = colors[(index + 1) % colors.length];
};

document.getElementById("burst").onclick = function() {
  burstUntil = performance.now() + 1000;

  particles.forEach(p => {
    p.sx = Math.random() * w;
    p.sy = Math.random() * h;
  });
};

window.addEventListener("resize", resize);

resize();
requestAnimationFrame(animate);
