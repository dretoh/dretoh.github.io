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
  } catch (err) {
    contentDiv.innerHTML = `<h2>Page Not Found</h2>`;
  }
}