const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "photo.jpg";

/* -------- CONFIG -------- */
// Controls image clarity (same on mobile & desktop)
const GRID_COLS = 120;
const GRID_ROWS = 120;
/* ------------------------ */

let dots = [];
let imgCanvas, imgCtx;
let isDragging = false;

/* -------- RESIZE -------- */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (img.complete) init();
}
window.addEventListener("resize", resize);

/* -------- IMAGE LOAD -------- */
img.onload = () => {
  resize();
};

/* -------- INIT -------- */
function init() {
  // Offscreen canvas to sample image colors
  imgCanvas = document.createElement("canvas");
  imgCtx = imgCanvas.getContext("2d");

  imgCanvas.width = GRID_COLS;
  imgCanvas.height = GRID_ROWS;

  imgCtx.drawImage(img, 0, 0, GRID_COLS, GRID_ROWS);

  createDots();
  draw();
}

/* -------- CREATE DOT GRID -------- */
function createDots() {
  dots = [];

  const cellW = canvas.width / GRID_COLS;
  const cellH = canvas.height / GRID_ROWS;
  const radius = Math.min(cellW, cellH) * 0.5;

  const imgData = imgCtx.getImageData(0, 0, GRID_COLS, GRID_ROWS).data;

  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const i = (y * GRID_COLS + x) * 4;

      dots.push({
        x: x * cellW + cellW / 2,
        y: y * cellH + cellH / 2,
        r: radius,
        color: `rgb(${imgData[i]}, ${imgData[i+1]}, ${imgData[i+2]})`,
        revealed: false
      });
    }
  }
}

/* -------- DRAW -------- */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const d of dots) {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = d.revealed ? d.color : "#222";
    ctx.fill();
  }
}

/* -------- REVEAL -------- */
function reveal(x, y) {
  for (const d of dots) {
    if (!d.revealed) {
      const dx = d.x - x;
      const dy = d.y - y;
      if (dx * dx + dy * dy < d.r * d.r) {
        d.revealed = true;
      }
    }
  }
  draw();
}

/* -------- DESKTOP -------- */
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  reveal(e.clientX, e.clientY);
});

canvas.addEventListener("mousemove", e => {
  if (isDragging) reveal(e.clientX, e.clientY);
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

/* -------- MOBILE -------- */
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  isDragging = true;
  const t = e.touches[0];
  reveal(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (!isDragging) return;
  e.preventDefault();
  const t = e.touches[0];
  reveal(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener("touchend", () => {
  isDragging = false;
});
