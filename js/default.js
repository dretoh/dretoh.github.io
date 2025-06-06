//logo 
const canvas = document.getElementById('dretoh');
const ctx = canvas.getContext('2d');

canvas.addEventListener('click', () => {
  window.location.href = '/index.html';
});

window.addEventListener('DOMContentLoaded', function() {
	const canvas = document.getElementById('dretoh');
	const ctx = canvas.getContext('2d');
  
	const ratio = window.devicePixelRatio || 1;
	const cssWidth = canvas.clientWidth;
	const cssHeight = canvas.clientHeight;
	canvas.width = cssWidth * ratio;
	canvas.height = cssHeight * ratio;
	canvas.style.width = cssWidth + 'px';
	canvas.style.height = cssHeight + 'px';
	ctx.scale(ratio, ratio);
  
	const txt = "DRETOH";
	const letterSpacing = 2; // 글자 사이 여백
	let i = 0; // 반복자
	const yBase = cssHeight / 2 + 16;
	const dashLen = 170;               
	let dashOffset = dashLen;
	const speed = 12;
	ctx.font = "bold 25px Montserrat";
	ctx.lineWidth = 1;
	ctx.fillStyle = "#333";
	ctx.strokeStyle = "#333";
  
	let totalTextWidth = 0;
	for (let ch of txt) {
		const w = ctx.measureText(ch).width;
		totalTextWidth += w;
	}
	totalTextWidth += letterSpacing * (txt.length + 1); //scaling

    // 캔버스 기준 중앙 정렬
    let x = (cssWidth - totalTextWidth) / 2;

    // 밑줄 animation
    let underlineStartTime = null;
    const underlineDuration = 600; 
    const underlineY = yBase + 10;
    const halfTextWidth = totalTextWidth / 2;
    const centerX = cssWidth / 2;

    
    function draw() {
        ctx.clearRect(x, 0, dashLen, cssHeight);
        ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]);
        dashOffset -= speed;
        ctx.strokeText(txt[i], x, yBase);
        if (dashOffset > 0) {
			requestAnimationFrame(draw);
        } else {
			ctx.fillText(txt[i], x, yBase);
			dashOffset = dashLen;
			const charWidth = ctx.measureText(txt[i]).width;
			x += charWidth + letterSpacing;
			i++;
			if (i < txt.length) {
				requestAnimationFrame(draw);
			} else {
				ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
				requestAnimationFrame(drawUnderline);
			}
        }
    }
	draw();

    function drawUnderline(timestamp) {
		if (!underlineStartTime) underlineStartTime = timestamp;
			const elapsed = timestamp - underlineStartTime;
			const progress = Math.min(elapsed / underlineDuration, 1); // 0~1

			const currentHalf = halfTextWidth * progress;

			ctx.save();
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

			const clearHeight = 4; 
			ctx.clearRect(0, underlineY - clearHeight, cssWidth, clearHeight + 2);

			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#333";

			ctx.moveTo(centerX, underlineY);
			ctx.lineTo(centerX - currentHalf, underlineY);
			ctx.moveTo(centerX, underlineY);
			ctx.lineTo(centerX + currentHalf, underlineY);

			ctx.stroke();
			ctx.restore();

			if (progress < 1) {
				requestAnimationFrame(drawUnderline);
			}
    }

});






// Post
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
  marked.setOptions({
    gfm: true,        // GitHub-flavored markdown
    breaks: true,     // Enter -> <br>
    smartLists: true,
    smartypants: true 
  });	
  let path = window.location.pathname;
  let page = (path === '/' || path.endsWith('/index.html') || path === '') ? 'default' : path.substring(1);
  page = page.split('/')[0] || 'default';

  try {
    const res = await fetch(`./assets/${page}.md`);
    if (!res.ok) throw new Error('Not found');
    const mdText = await res.text();
    contentDiv.innerHTML = marked.parse(mdText);
  } catch (err) {
    contentDiv.innerHTML = `<h2>Page Not Found</h2>`;
  }
}