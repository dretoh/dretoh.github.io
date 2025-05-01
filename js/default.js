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

  function createDomExplosion(x, y) {
    const colors = ["cyan", "magenta", "yellow", "blue", "lime", "red"];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60 + 20;
      const size = Math.random() * 6 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.position = "absolute";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = "50%";
      particle.style.backgroundColor = color;
      particle.style.pointerEvents = "none";
      particle.style.opacity = "1";
      particle.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";
      particle.style.transform = `translate(0px, 0px)`;

      container.appendChild(particle);

      // 트리거 트랜지션
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        particle.style.opacity = "0";
      });

      // 자동 제거
      setTimeout(() => {
        particle.remove();
      }, 600);
    }
  }

  function resetBallWithExplosion() {
    const centerX = ballX + 20;
    const centerY = ballY + 20;
    createDomExplosion(centerX, centerY);
    ballX = container.clientWidth / 2 - 20;
    ballY = container.clientHeight / 2 - 20;
    updateBallPosition();
  }

  resetBallWithExplosion();

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
        resetBallWithExplosion();
      } else {
        updateBallPosition();
      }
    }
  });
}



/* 마우스 자동 스크롤 */

// 스크롤 임계치(픽셀 단위)와 스크롤 속도(픽셀 단위) 설정
const threshold = 50; // 창 상하 50px 영역
const scrollSpeed = 5; // 매 틱마다 5px 이동
let autoScrollInterval = null;

// 마우스 위치에 따라 자동 스크롤을 시작하거나 정지하는 함수
document.addEventListener('mousemove', function(event) {
	// 위쪽 영역에 마우스가 있을 경우 (스크롤 업)
	if (event.clientY < threshold) {
		// 이미 스크롤 동작 중이라면 추가 실행하지 않음
		if (!autoScrollInterval) {
			autoScrollInterval = setInterval(() => {
				window.scrollBy(0, -scrollSpeed);
			}, 16); // 약 60fps 기준
		}
	}
	// 아래쪽 영역에 마우스가 있을 경우 (스크롤 다운)
	else if (event.clientY > window.innerHeight - threshold) {
		if (!autoScrollInterval) {
			autoScrollInterval = setInterval(() => {
				window.scrollBy(0, scrollSpeed);
			}, 16);
		}
	}
	// 마우스가 중앙 영역에 있을 때 스크롤 정지
	else {
		if (autoScrollInterval) {
			clearInterval(autoScrollInterval);
			autoScrollInterval = null;
		}
	}
});

document.addEventListener('mouseleave', () => {
	if (autoScrollInterval) {
		clearInterval(autoScrollInterval);
		autoScrollInterval = null;
	}
});