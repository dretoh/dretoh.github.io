<div id="game-container" style="width: 100%; height: 500px; background-color: #f0f0f0; position: relative; overflow: hidden;">
  <div id="ball" style="
    width: 40px;
    height: 40px;
    background-color: crimson;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  "></div>
</div>

<script>
  const ball = document.getElementById('ball');
  const container = document.getElementById('game-container');

  const speedFactor = 8;

  // 초기 위치 중앙 설정
  let ballX = container.clientWidth / 2 - 20;
  let ballY = container.clientHeight / 2 - 20;

  // 위치 업데이트 함수
  function updateBallPosition() {
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
  }

  // 벽에 부딪혔는지 체크
  function isOutOfBounds() {
    return (
      ballX < 0 || ballX + 40 > container.clientWidth ||
      ballY < 0 || ballY + 40 > container.clientHeight
    );
  }

  // 리셋 함수
  function resetBall() {
    ballX = container.clientWidth / 2 - 20;
    ballY = container.clientHeight / 2 - 20;
    updateBallPosition();
  }

  resetBall(); // 초기화

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
      // 거리가 가까울수록 속도 증가
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
</script>
