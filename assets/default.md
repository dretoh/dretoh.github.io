<div style="width: 100%; height: 500px; background-color: #f0f0f0; position: relative; overflow: hidden;">
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
  const container = ball.parentElement;
  const speedFactor = 0.15;
  let animationFrame;

  function resetBall() {
    ball.style.left = "50%";
    ball.style.top = "50%";
  }

  function moveBallAway(mouseX, mouseY) {
    const rect = container.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();

    const ballX = ballRect.left + ballRect.width / 2;
    const ballY = ballRect.top + ballRect.height / 2;

    const dx = ballX - mouseX;
    const dy = ballY - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100) {
      const moveX = dx * speedFactor;
      const moveY = dy * speedFactor;

      let newLeft = ball.offsetLeft + moveX;
      let newTop = ball.offsetTop + moveY;

      // Boundary check
      if (
        newLeft < 0 || newLeft + ball.offsetWidth > container.clientWidth ||
        newTop < 0 || newTop + ball.offsetHeight > container.clientHeight
      ) {
        resetBall();
        return;
      }

      ball.style.left = `${newLeft}px`;
      ball.style.top = `${newTop}px`;
    }
  }

  container.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      moveBallAway(e.clientX, e.clientY);
    });
  });
</script>
