const contentDiv = document.getElementById('posts');

window.addEventListener('DOMContentLoaded', handleLocation);
window.addEventListener('popstate', handleLocation);

document.addEventListener('click', (event) => {
  if (event.target.matches('a[data-link]')) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    history.pushState(null, null, href);
    handleLocation();
  }
});

async function handleLocation() {
  let path = window.location.pathname;
  let page = (path === '/' || path.endsWith('/index.html') || path === '') ? 'default' : path.substring(1);
  page = page.split('/')[0] || 'default';

  try {
    const res = await fetch(`./assets/${page}.md`);
    if (!res.ok) throw new Error('Not found');
    const mdText = await res.text();
    contentDiv.innerHTML = marked.parse(mdText);
    if (page === 'default') {
      initBallGame();
    }
  } catch (err) {
    contentDiv.innerHTML = `<h2>Page Not Found</h2>`;
  }
}

function initBallGame() {
  const container = document.getElementById("game-container");
  if (!container) return;

  container.innerHTML = `
    <div style="width:100%;height:500px;position:relative;background:#f0f0f0;overflow:hidden;">
      <div id="ball" style="width:40px;height:40px;background:crimson;border-radius:50%;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)"></div>
    </div>`;

  const ball = document.getElementById('ball');
  const speedFactor = 8;

  let ballX = container.clientWidth / 2 - 20;
  let ballY = container.clientHeight / 2 - 20;

  function updateBallPosition() {
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
  }

  function isOutOfBounds() {
    return (
      ballX < 0 || ballX + 40 > container.clientWidth ||
      ballY < 0 || ballY + 40 > container.clientHeight
    );
  }

  function resetBall() {
    ballX = container.clientWidth / 2 - 20;
    ballY = container.clientHeight / 2 - 20;
    updateBallPosition();
  }

  resetBall();

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = ballX + 20;
    const centerY = ballY + 20;

    const dx = centerX - mouseX;
    const dy = centerY - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100) {
      const moveX = (dx / dist) * (100 - dist) * 0.1 * speedFactor;
      const moveY = (dy / dist) * (100 - dist) * 0.1 * speedFactor;

      ballX += moveX;
      ballY += moveY;

      if (isOutOfBounds()) {
        resetBall();
      } else {
        updateBallPosition();
      }
    }
  });
}
