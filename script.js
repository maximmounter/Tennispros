const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const PADDLE_W = 12;
const PADDLE_H = 72;
const BALL_R = 8;
const COURT_GREEN = '#2d7a3a';
const LINE_WHITE = 'rgba(255,255,255,0.85)';
const NET_COLOR = 'rgba(255,255,255,0.5)';

let vsAI = false;
let score = [0, 0];
let serving = true;
let serveSide = 0;
let winner = null;

const state = {
  p1: { y: H / 2 - PADDLE_H / 2 },
  p2: { y: H / 2 - PADDLE_H / 2 },
  ball: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
};

const keys = {};

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    if (winner) {
      resetGame();
      return;
    }
    if (serving) serve();
  }
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});

function resetGame() {
  score = [0, 0];
  winner = null;
  serving = true;
  serveSide = 0;
  state.p1.y = H / 2 - PADDLE_H / 2;
  state.p2.y = H / 2 - PADDLE_H / 2;
  state.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
  document.getElementById('s1').textContent = 0;
  document.getElementById('s2').textContent = 0;
  setMsg('Tap Serve or press SPACE');
}

function serve() {
  serving = false;
  const dir = serveSide === 0 ? 1 : -1;
  state.ball.vx = dir * 5;
  state.ball.vy = Math.random() * 4 - 2;
  state.ball.x = W / 2;
  state.ball.y = H / 2;
  setMsg('');
}

function setMsg(m) {
  document.getElementById('msg').textContent = m;
}

function point(player) {
  score[player]++;
  document.getElementById('s1').textContent = score[0];
  document.getElementById('s2').textContent = score[1];
  serving = true;
  serveSide = player;
  state.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
  state.p1.y = H / 2 - PADDLE_H / 2;
  state.p2.y = H / 2 - PADDLE_H / 2;

  if (score[player] >= 7) {
    winner = player;
    setMsg(`Player ${player + 1} wins! SPACE to play again`);
  } else {
    const pts = ['15', '30', '40', 'Game'];
    setMsg(`${pts[Math.min(score[0], 3)]}-${pts[Math.min(score[1], 3)]} — SPACE to serve`);
  }
}

function drawCourt() {
  ctx.fillStyle = COURT_GREEN;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = LINE_WHITE;
  ctx.lineWidth = 2;

  ctx.strokeRect(30, 20, W - 60, H - 40);
  ctx.beginPath(); ctx.moveTo(W / 2, 20); ctx.lineTo(W / 2, H - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30, H / 2); ctx.lineTo(W - 30, H / 2); ctx.stroke();

  const svcL = 30 + (W - 60) * 0.21;
  const svcR = W - 30 - (W - 60) * 0.21;
  ctx.beginPath(); ctx.moveTo(svcL, 20); ctx.lineTo(svcL, H - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(svcR, 20); ctx.lineTo(svcR, H - 20); ctx.stroke();

  for (let i = 1; i < 8; i++) {
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(30, 20 + i * (H - 40) / 8);
    ctx.lineTo(W - 30, 20 + i * (H - 40) / 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const postH = H * 0.7;
  const postTop = (H - postH) / 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(W / 2, postTop); ctx.lineTo(W / 2, postTop + postH); ctx.stroke();

  ctx.strokeStyle = NET_COLOR;
  ctx.lineWidth = 1;
  for (let y = postTop; y < postTop + postH; y += 8) {
    ctx.beginPath(); ctx.moveTo(W / 2 - 3, y); ctx.lineTo(W / 2 + 3, y); ctx.stroke();
  }
}

function drawPlayer(cx, cy, color, facingRight) {
  const headR = 9;
  const bodyH = 22;
  const legH = 18;
  const armLen = 14;
  const racketLen = 12;
  const dir = facingRight ? 1 : -1;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + headR + bodyH + legH + 2, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy + headR + bodyH);
  ctx.lineTo(cx - 6, cy + headR + bodyH + legH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + headR + bodyH);
  ctx.lineTo(cx + 6, cy + headR + bodyH + legH);
  ctx.stroke();

  // shoes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(cx - 6, cy + headR + bodyH + legH + 2, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy + headR + bodyH + legH + 2, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // body
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx, cy + headR);
  ctx.lineTo(cx, cy + headR + bodyH);
  ctx.stroke();

  // shirt number / stripe
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + headR + 8);
  ctx.lineTo(cx + 4, cy + headR + 8);
  ctx.stroke();

  // hitting arm (towards ball side)
  const armAngle = -0.4 * dir;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy + headR + 6);
  const elbowX = cx + Math.cos(armAngle) * armLen * dir;
  const elbowY = cy + headR + 6 + Math.sin(Math.abs(armAngle)) * armLen;
  ctx.lineTo(elbowX, elbowY);
  ctx.stroke();

  // racket
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  const racketTipX = elbowX + dir * racketLen;
  const racketTipY = elbowY - 4;
  ctx.lineTo(racketTipX, racketTipY);
  ctx.stroke();

  // racket head
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(racketTipX, racketTipY, 7, 9, dir * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // racket strings
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 0.8;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(racketTipX + i * 3, racketTipY - 8);
    ctx.lineTo(racketTipX + i * 3, racketTipY + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(racketTipX - 6, racketTipY + i * 3);
    ctx.lineTo(racketTipX + 6, racketTipY + i * 3);
    ctx.stroke();
  }

  // other arm
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy + headR + 6);
  ctx.lineTo(cx - dir * 10, cy + headR + 14);
  ctx.stroke();

  // head
  ctx.fillStyle = '#f5c5a3';
  ctx.beginPath();
  ctx.arc(cx, cy, headR, 0, Math.PI * 2);
  ctx.fill();

  // hair / cap
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, headR, Math.PI, Math.PI * 2);
  ctx.fill();

  // cap brim
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(cx - headR - 2, cy - 2, (headR + 2) * 2, 4);
  ctx.fill();

  // eyes
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(cx + dir * 3, cy + 2, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBall(x, y) {
  ctx.fillStyle = '#d4e157';
  ctx.beginPath(); ctx.arc(x, y, BALL_R, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x + 1, y - 1, BALL_R, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(x - 1, y + 1, BALL_R, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
}

function update() {
  const SPEED = 7;
  const p1 = state.p1;
  const p2 = state.p2;
  const ball = state.ball;

  if (keys['w'] || keys['W']) p1.y = Math.max(0, p1.y - SPEED);
  if (keys['s'] || keys['S']) p1.y = Math.min(H - PADDLE_H, p1.y + SPEED);

  if (!vsAI) {
    if (keys['ArrowUp']) p2.y = Math.max(0, p2.y - SPEED);
    if (keys['ArrowDown']) p2.y = Math.min(H - PADDLE_H, p2.y + SPEED);
  } else {
    const aiTarget = ball.y - PADDLE_H / 2;
    const aiSpeed = 4.5;
    if (p2.y < aiTarget) p2.y = Math.min(H - PADDLE_H, p2.y + aiSpeed);
    else p2.y = Math.max(0, p2.y - aiSpeed);
  }

  if (!serving) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy *= -1; }
    if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy *= -1; }

    const p1x = 30 + 10;
    if (
      ball.vx < 0 &&
      ball.x - BALL_R < p1x + PADDLE_W &&
      ball.x + BALL_R > p1x &&
      ball.y > p1.y &&
      ball.y < p1.y + PADDLE_H
    ) {
      ball.x = p1x + PADDLE_W + BALL_R;
      ball.vx = Math.abs(ball.vx) * 1.05;
      const rel = (ball.y - (p1.y + PADDLE_H / 2)) / (PADDLE_H / 2);
      ball.vy = rel * 6;
      if (Math.abs(ball.vx) > 14) ball.vx = 14;
    }

    const p2x = W - 30 - 10 - PADDLE_W;
    if (
      ball.vx > 0 &&
      ball.x + BALL_R > p2x &&
      ball.x - BALL_R < p2x + PADDLE_W &&
      ball.y > p2.y &&
      ball.y < p2.y + PADDLE_H
    ) {
      ball.x = p2x - BALL_R;
      ball.vx = -Math.abs(ball.vx) * 1.05;
      const rel = (ball.y - (p2.y + PADDLE_H / 2)) / (PADDLE_H / 2);
      ball.vy = rel * 6;
      if (Math.abs(ball.vx) > 14) ball.vx = -14;
    }

    if (ball.x < 0 && !winner) point(1);
    if (ball.x > W && !winner) point(0);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawCourt();
  drawPlayer(30 + 10 + PADDLE_W / 2, state.p1.y + PADDLE_H / 2, '#ef5350', true);
  drawPlayer(W - 30 - 10 - PADDLE_W / 2, state.p2.y + PADDLE_H / 2, '#42a5f5', false);

  if (!serving || winner) {
    drawBall(state.ball.x, state.ball.y);
  } else {
    const bx = serveSide === 0 ? 60 : W - 60;
    drawBall(bx, H / 2);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById('btn-restart').addEventListener('click', resetGame);
document.getElementById('btn-serve').addEventListener('click', () => {
  if (winner) { resetGame(); return; }
  if (serving) serve();
});
document.getElementById('btn-ai').addEventListener('click', () => {
  vsAI = !vsAI;
  document.getElementById('btn-ai').textContent = `vs AI: ${vsAI ? 'ON' : 'OFF'}`;
  resetGame();
});

// Touch controls — drag on left half moves P1, right half moves P2
const touches = {}; // track active touches by identifier

function getCanvasY(clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleY = H / rect.height;
  return (clientY - rect.top) * scaleY;
}

function getCanvasX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  return (clientX - rect.left) * scaleX;
}

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    touches[t.identifier] = { x: getCanvasX(t.clientX), y: getCanvasY(t.clientY) };
  }
  // Single tap anywhere on canvas = serve
  if (e.touches.length === 1) {
    if (winner) { resetGame(); return; }
    if (serving) serve();
  }
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const cx = getCanvasX(t.clientX);
    const cy = getCanvasY(t.clientY);
    touches[t.identifier] = { x: cx, y: cy };

    const targetY = Math.min(Math.max(cy - PADDLE_H / 2, 0), H - PADDLE_H);

    if (cx < W / 2) {
      // Left side → P1
      state.p1.y = targetY;
    } else {
      // Right side → P2
      if (!vsAI) state.p2.y = targetY;
    }
  }
}, { passive: false });

canvas.addEventListener('touchend', e => {
  for (const t of e.changedTouches) {
    delete touches[t.identifier];
  }
}, { passive: false });

loop();
