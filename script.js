const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const W = canvas.width;   // 640
const H = canvas.height;  // 360

const PADDLE_W = 12;
const PADDLE_H = 72;
const BALL_R   = 8;

// ── State ────────────────────────────────────────────────────────────────────
let vsAI     = false;
let score    = [0, 0];
let serving  = true;
let serveSide = 0;
let winner   = null;

const state = {
  p1:   { y: H / 2 - PADDLE_H / 2 },
  p2:   { y: H / 2 - PADDLE_H / 2 },
  ball: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
};

const keys     = {};
const btnState = { p1Up: false, p1Down: false, p2Up: false, p2Down: false };

// ── Input: keyboard ───────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    if (winner) { resetGame(); return; }
    if (serving) serve();
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// ── Input: d-pad buttons ──────────────────────────────────────────────────────
function holdBtn(id, key) {
  const el = document.getElementById(id);
  const on  = () => { btnState[key] = true;  el.style.background = '#383838'; };
  const off = () => { btnState[key] = false; el.style.background = ''; };
  el.addEventListener('mousedown',   on);
  el.addEventListener('mouseup',     off);
  el.addEventListener('mouseleave',  off);
  el.addEventListener('touchstart',  e => { e.preventDefault(); on();  }, { passive: false });
  el.addEventListener('touchend',    e => { e.preventDefault(); off(); }, { passive: false });
  el.addEventListener('touchcancel', e => { e.preventDefault(); off(); }, { passive: false });
}
holdBtn('p1-up',   'p1Up');
holdBtn('p1-down', 'p1Down');
holdBtn('p2-up',   'p2Up');
holdBtn('p2-down', 'p2Down');

// ── Game logic ────────────────────────────────────────────────────────────────
function setMsg(m) { document.getElementById('msg').textContent = m; }

function resetGame() {
  score = [0, 0];
  winner = null;
  serving = true;
  serveSide = 0;
  state.p1.y = state.p2.y = H / 2 - PADDLE_H / 2;
  state.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
  document.getElementById('s1').textContent = 0;
  document.getElementById('s2').textContent = 0;
  setMsg('Press Serve or SPACE to start');
}

function serve() {
  serving = false;
  const dir = serveSide === 0 ? 1 : -1;
  state.ball.vx = dir * 5;
  state.ball.vy = Math.random() * 4 - 2;
  state.ball.x  = W / 2;
  state.ball.y  = H / 2;
  setMsg('');
}

function point(player) {
  score[player]++;
  document.getElementById('s1').textContent = score[0];
  document.getElementById('s2').textContent = score[1];
  serving   = true;
  serveSide = player;
  state.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
  state.p1.y = state.p2.y = H / 2 - PADDLE_H / 2;
  if (score[player] >= 3) {
    winner = player;
    setMsg(`Player ${player + 1} wins!  Press Serve to play again`);
  } else {
    setMsg(`${score[0]} - ${score[1]} — Press Serve`);
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update() {
  const SPEED = 7;
  const { p1, p2, ball } = state;

  // P1 movement
  if (keys['w'] || keys['W'] || btnState.p1Up)   p1.y = Math.max(0, p1.y - SPEED);
  if (keys['s'] || keys['S'] || btnState.p1Down) p1.y = Math.min(H - PADDLE_H, p1.y + SPEED);

  // P2 movement
  if (!vsAI) {
    if (keys['ArrowUp']   || btnState.p2Up)   p2.y = Math.max(0, p2.y - SPEED);
    if (keys['ArrowDown'] || btnState.p2Down) p2.y = Math.min(H - PADDLE_H, p2.y + SPEED);
  } else {
    const aiSpeed = 4.5;
    const target  = ball.y - PADDLE_H / 2;
    if (p2.y < target) p2.y = Math.min(H - PADDLE_H, p2.y + aiSpeed);
    else               p2.y = Math.max(0, p2.y - aiSpeed);
  }

  if (serving) return;

  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall bounce
  if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy *= -1; }
  if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy *= -1; }

  // P1 paddle hit
  const p1x = 30 + 10;
  if (ball.vx < 0 && ball.x - BALL_R < p1x + PADDLE_W && ball.x + BALL_R > p1x &&
      ball.y > p1.y && ball.y < p1.y + PADDLE_H) {
    ball.x  = p1x + PADDLE_W + BALL_R;
    ball.vx = Math.min(Math.abs(ball.vx) * 1.05, 14);
    ball.vy = ((ball.y - (p1.y + PADDLE_H / 2)) / (PADDLE_H / 2)) * 6;
  }

  // P2 paddle hit
  const p2x = W - 30 - 10 - PADDLE_W;
  if (ball.vx > 0 && ball.x + BALL_R > p2x && ball.x - BALL_R < p2x + PADDLE_W &&
      ball.y > p2.y && ball.y < p2.y + PADDLE_H) {
    ball.x  = p2x - BALL_R;
    ball.vx = -Math.min(Math.abs(ball.vx) * 1.05, 14);
    ball.vy = ((ball.y - (p2.y + PADDLE_H / 2)) / (PADDLE_H / 2)) * 6;
  }

  // Score
  if (!winner) {
    if (ball.x < 0) point(1);
    if (ball.x > W) point(0);
  }
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawCourt() {
  ctx.fillStyle = '#2d7a3a';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 20, W - 60, H - 40);
  ctx.beginPath(); ctx.moveTo(W/2, 20);  ctx.lineTo(W/2, H-20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30, H/2);  ctx.lineTo(W-30, H/2); ctx.stroke();

  const svcL = 30 + (W-60) * 0.21;
  const svcR = W - 30 - (W-60) * 0.21;
  ctx.beginPath(); ctx.moveTo(svcL, 20); ctx.lineTo(svcL, H-20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(svcR, 20); ctx.lineTo(svcR, H-20); ctx.stroke();

  for (let i = 1; i < 8; i++) {
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(30, 20 + i*(H-40)/8);
    ctx.lineTo(W-30, 20 + i*(H-40)/8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Net
  const netTop = H * 0.15, netBot = H * 0.85;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(W/2, netTop); ctx.lineTo(W/2, netBot); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  for (let y = netTop; y < netBot; y += 8) {
    ctx.beginPath(); ctx.moveTo(W/2-3, y); ctx.lineTo(W/2+3, y); ctx.stroke();
  }
}

function drawPlayer(cx, cy, color, facingRight) {
  const headR = 9, bodyH = 22, legH = 18, armLen = 14, racketLen = 12;
  const dir = facingRight ? 1 : -1;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + headR + bodyH + legH + 2, 10, 4, 0, 0, Math.PI*2);
  ctx.fill();

  // Legs
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy+headR+bodyH); ctx.lineTo(cx-6, cy+headR+bodyH+legH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy+headR+bodyH); ctx.lineTo(cx+6, cy+headR+bodyH+legH); ctx.stroke();

  // Shoes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(cx-6, cy+headR+bodyH+legH+2, 5, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+6, cy+headR+bodyH+legH+2, 5, 3, 0, 0, Math.PI*2); ctx.fill();

  // Body
  ctx.strokeStyle = color; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(cx, cy+headR); ctx.lineTo(cx, cy+headR+bodyH); ctx.stroke();

  // Shirt stripe
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx-4, cy+headR+8); ctx.lineTo(cx+4, cy+headR+8); ctx.stroke();

  // Hitting arm
  const armAngle = -0.4 * dir;
  ctx.strokeStyle = color; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx, cy+headR+6);
  const elbowX = cx + Math.cos(armAngle) * armLen * dir;
  const elbowY = cy + headR + 6 + Math.sin(Math.abs(armAngle)) * armLen;
  ctx.lineTo(elbowX, elbowY); ctx.stroke();

  // Racket handle
  const tipX = elbowX + dir * racketLen, tipY = elbowY - 4;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(elbowX, elbowY); ctx.lineTo(tipX, tipY); ctx.stroke();

  // Racket head
  ctx.beginPath(); ctx.ellipse(tipX, tipY, 7, 9, dir*0.3, 0, Math.PI*2); ctx.stroke();

  // Strings
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.8;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(tipX+i*3, tipY-8); ctx.lineTo(tipX+i*3, tipY+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tipX-6, tipY+i*3); ctx.lineTo(tipX+6,  tipY+i*3); ctx.stroke();
  }

  // Other arm
  ctx.strokeStyle = color; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx, cy+headR+6); ctx.lineTo(cx-dir*10, cy+headR+14); ctx.stroke();

  // Head
  ctx.fillStyle = '#f5c5a3';
  ctx.beginPath(); ctx.arc(cx, cy, headR, 0, Math.PI*2); ctx.fill();

  // Cap
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, headR, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillRect(cx - headR - 2, cy - 2, (headR+2)*2, 4);

  // Eye
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cx + dir*3, cy+2, 1.5, 0, Math.PI*2); ctx.fill();
}

function drawBall(x, y) {
  ctx.fillStyle = '#d4e157';
  ctx.beginPath(); ctx.arc(x, y, BALL_R, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x+1, y-1, BALL_R, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(x-1, y+1, BALL_R, 1.1*Math.PI, 1.9*Math.PI); ctx.stroke();
}

function isLandscapeMobile() {
  return window.innerHeight < 500 && window.innerWidth > window.innerHeight;
}

function drawCanvasScore() {
  // Draw score on canvas in landscape mode (scoreboard is hidden)
  ctx.font = 'bold 36px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText(`${score[0]}  -  ${score[1]}`, W/2, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`${score[0]}  -  ${score[1]}`, W/2, 7);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawCourt();
  drawPlayer(30 + 10 + PADDLE_W/2,       state.p1.y + PADDLE_H/2, '#ef5350', true);
  drawPlayer(W - 30 - 10 - PADDLE_W/2,   state.p2.y + PADDLE_H/2, '#42a5f5', false);
  const bx = serving ? (serveSide === 0 ? 60 : W-60) : state.ball.x;
  const by = serving ? H/2 : state.ball.y;
  drawBall(bx, by);
  if (isLandscapeMobile()) drawCanvasScore();
}

// ── Loop ──────────────────────────────────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ── Button wiring ─────────────────────────────────────────────────────────────
document.getElementById('btn-serve').addEventListener('click', () => {
  if (winner) { resetGame(); return; }
  if (serving) serve();
});
document.getElementById('btn-restart').addEventListener('click', resetGame);
document.getElementById('btn-ai').addEventListener('click', () => {
  vsAI = !vsAI;
  document.getElementById('btn-ai').textContent = `vs AI: ${vsAI ? 'ON' : 'OFF'}`;
  resetGame();
});

loop();
