const contentDiv = document.getElementById('posts');

window.addEventListener('DOMContentLoaded', handleLocation);
window.addEventListener('popstate', handleLocation);
// 링크 클릭 시 라우팅 처리
document.addEventListener('click', (event) => {
  // data-link 속성이 있는 내부 링크만 처리
  if (event.target.matches('a[data-link]')) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    history.pushState(null, null, href);  // URL 변경
    handleLocation();  // 해당 콘텐츠 로드
  }
});

async function handleLocation() {
  let path = window.location.pathname;
  // 초기 경로 또는 index.html 로드 시 default.md 로 처리
  let page = (path === '/' || path.endsWith('/index.html') || path === '') ? 'default' : path.substring(1);
  // 경로에 하위 폴더가 붙었을 경우 맨 앞 부분만 사용
  page = page.split('/')[0] || 'default';

  try {
    const res = await fetch(`assets/${page}.md`);
    if (!res.ok) throw new Error('Not found');
    const mdText = await res.text();
    // 마크다운을 HTML로 변환하여 삽입&#8203;:contentReference[oaicite:3]{index=3}
    contentDiv.innerHTML = marked.parse(mdText);
  } catch (err) {
    contentDiv.innerHTML = `<h2>페이지를 찾을 수 없습니다</h2>`;
  }
}
