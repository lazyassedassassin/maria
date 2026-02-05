const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "photo.jpg";

let circles = [];
let imgCanvas, imgCtx;
let offsetX = 0, offsetY = 0;
let isDragging = false;

/* ---------- RESIZE ---------- */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------- IMAGE LOAD ---------- */
img.onload = () => {
  imgCanvas = document.createElement("canvas");
  imgCtx = imgCanvas.getContext("2d");

  const scale = Math.min(
    canvas.width / img.width,
    canvas.height / img.height
  );

  imgCanvas.width = img.width * scale;
  imgCanvas.height = img.height * scale;

  offsetX = (canvas.width - imgCanvas.width) / 2;
  offsetY = (canvas.height - imgCanvas.height) / 2;

  imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);

  circles = [{
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: Math.min(canvas.width, canvas.height) / 2
  }];

  draw();
};

img.onerror = () => {
  alert("photo.jpg not found or failed to load");
};

/* ---------- COLOR PICK ---------- */
function getColor(x, y) {
  const ix = Math.floor(x - offsetX);
  const iy = Math.floor(y - offsetY);

  if (
    ix < 0 || iy < 0 ||
    ix >= imgCanvas.width ||
    iy >= imgCanvas.height
  ) return "#000";

  const d = imgCtx.getImageData(ix, iy, 1, 1).data;
  return `rgb(${d[0]},${d[1]},${d[2]})`;
}

/* ---------- DRAW ---------- */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const c of circles) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = getColor(c.x, c.y);
    ctx.fill();
  }
}

/* ---------- SPLIT ---------- */
function split(x, y) {
  const next = [];

  for (const c of circles) {
    const d = Math.hypot(x - c.x, y - c.y);
    if (d < c.r && c.r > 6) {
      const r = c.r / 2;
      next.push(
        { x: c.x - r, y: c.y - r, r },
        { x: c.x + r, y: c.y - r, r },
        { x: c.x - r, y: c.y + r, r },
        { x: c.x + r, y: c.y + r, r }
      );
    } else {
      next.push(c);
    }
  }

  circles = next;
  draw();
}

/* ---------- DESKTOP DRAG ---------- */
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  split(e.clientX, e.clientY);
});

canvas.addEventListener("mousemove", e => {
  if (!isDragging) return;
  split(e.clientX, e.clientY);
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

/* ---------- MOBILE DRAG ---------- */
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  isDragging = true;
  const t = e.touches[0];
  split(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (!isDragging) return;
  e.preventDefault();
  const t = e.touches[0];
  split(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener("touchend", () => {
  isDragging = false;
});
