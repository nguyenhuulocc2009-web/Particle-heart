<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#05000d">
<title>Particle Heart ❤️</title>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #030008;
  color: white;
  font-family: Arial, sans-serif;
}

canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
}

.content {
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 45px 18px 30px;
  pointer-events: none;
}

h1 {
  font-size: clamp(23px, 6vw, 34px);
  letter-spacing: 3px;
  text-align: center;
  color: #ff70d4;
  text-shadow: 0 0 10px #ff168c, 0 0 30px #a000ff;
}

.subtitle {
  margin-top: 12px;
  text-align: center;
  font-size: 13px;
  color: #c9b9e8;
  letter-spacing: 1px;
}

.controls {
  pointer-events: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 350px;
}

button {
  color: white;
  background: #170b2b;
  border: 1px solid #d74cff;
  border-radius: 30px;
  padding: 12px 17px;
  font-size: 13px;
  box-shadow: 0 0 15px #a000ff44;
  cursor: pointer;
}

button:active {
  transform: scale(.96);
}

.footer {
  margin-top: 15px;
  text-align: center;
  color: #8c7baf;
  font-size: 11px;
  letter-spacing: 2px;
}
</style>
</head>

<body>
<canvas id="canvas"></canvas>

<div class="content">
  <div>
    <h1>PARTICLE HEART</h1>
    <p class="subtitle">A LITTLE HEART MADE OF LIGHT ❤️</p>
  </div>

  <div>
    <div class="controls">
      <button id="toggle">TẠM DỪNG</button>
      <button id="color">ĐỔI MÀU ✨</button>
      <button id="burst">TAN BIẾN 💫</button>
    </div>
    <p class="footer">MADE WITH LOVE</p>
  </div>
</div>

<script>
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let w, h, dpr;
let particles = [];
let hue = 325;
let running = true;
let burstUntil = 0;
let lastTime = 0;
let elapsed = 0;

const TOTAL = 1000;
const colors = [325, 285, 190, 120, 45, 350];

// Công thức tọa độ trái tim
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

// Tạo hạt nằm bên trong trái tim
function makeHeartPoint() {
  const t = Math.random() * Math.PI * 2;

  // Lấy điểm trên đường viền rồi kéo về tâm
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
