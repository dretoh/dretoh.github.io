<h2>Welcome to my playground</h2>
<p>Try relaxing with this bouncing ball animation :)</p>

<canvas id="ballCanvas" width="500" height="300" style="border:1px solid #ccc;"></canvas>

<script>
  const canvas = document.getElementById('ballCanvas');
  const ctx = canvas.getContext('2d');

  let x = canvas.width / 2;
  let y = canvas.height / 2;
  let dx = 2;
  let dy = 3;
  const radius = 15;

  function drawBall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#6C6C6C";
    ctx.fill();
    ctx.closePath();

    if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
    if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;

    x += dx;
    y += dy;

    requestAnimationFrame(drawBall);
  }

  drawBall();
</script>
