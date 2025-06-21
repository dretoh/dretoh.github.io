window.addEventListener('DOMContentLoaded', () => 
{

  const canvas = document.getElementById('dretoh');
  const ctx = canvas.getContext('2d');
  const txt = "PWNLIFE";
  const letterSpacing = 2;
  const dashLen = 170;
  const speed = 12;
  const underlineDuration = 600;

  let textRAF, underlineRAF;

  function resetCanvas() 
  {
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    canvas.width  = w * ratio;
    canvas.height = h * ratio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(0.5, 0.5);
    ctx.scale(ratio, ratio);
  }

  function animateText() 
  {
    if (textRAF) cancelAnimationFrame(textRAF);
    if (underlineRAF) cancelAnimationFrame(underlineRAF);

    ctx.font = "bold 25px Montserrat";
    ctx.lineWidth = 1;
    ctx.fillStyle = ctx.strokeStyle = "#333";

    let totalW = txt.split('').reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + letterSpacing * (txt.length + 1);
    const startX = (canvas.clientWidth - totalW) / 2;
    const yBase  = canvas.clientHeight / 2 + 16;
    let x = startX;
    let i = 0;
    let dashOff = dashLen;

    function drawChar() 
    {
      ctx.clearRect(x, 0, dashLen, canvas.clientHeight);
      ctx.setLineDash([dashLen - dashOff, dashOff - speed]);
      dashOff -= speed;
      ctx.strokeText(txt[i], x, yBase);

      if (dashOff > 0) 
      {
        textRAF = requestAnimationFrame(drawChar);
      } else 
      {
        ctx.fillText(txt[i], x, yBase);
        dashOff = dashLen;
        x += ctx.measureText(txt[i]).width + letterSpacing;
        i++;
        if (i < txt.length) {
          textRAF = requestAnimationFrame(drawChar);
        } else 
        {
          underlineRAF = requestAnimationFrame(drawUnderline);
        }
      }
    }

    let underlineStart = null;
    const halfW = totalW / 2;
    const centerX = canvas.clientWidth / 2;
    const lineY = yBase + 10;

    function drawUnderline(ts) 
    {
      if (!underlineStart) underlineStart = ts;
      const p = Math.min((ts - underlineStart) / underlineDuration, 1);
      const cur = halfW * p;

      ctx.clearRect(0, lineY - 4, canvas.clientWidth, 6);
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#333";
      ctx.moveTo(centerX, lineY);
      ctx.lineTo(centerX - cur, lineY);
      ctx.moveTo(centerX, lineY);
      ctx.lineTo(centerX + cur - 3, lineY);
      ctx.stroke();

      if (p < 1) 
      {
        underlineRAF = requestAnimationFrame(drawUnderline);
      }
    }

    drawChar();
  }

  function renderCanvas() 
  {
    resetCanvas();
    animateText();
  }

  canvas.addEventListener('click', () => 
  {
    window.location.href = '/index.html';
  });

  document.fonts.ready.then(renderCanvas);

  window.addEventListener('resize', renderCanvas);
});










// // Post
// const contentDiv = document.getElementById('posts');

// window.addEventListener('DOMContentLoaded', handleLocation);
// window.addEventListener('popstate', handleLocation);

// document.addEventListener('click', (event) => {
//   if (event.target.matches('a[data-link]')) {
//     event.preventDefault();
//     const href = event.target.getAttribute('href');
//     history.pushState(null, null, href);
//     handleLocation();
//   }
// });

// async function handleLocation() {
//   marked.setOptions({
//     gfm: true,        // GitHub-flavored markdown
//     breaks: true,     // Enter -> <br>
//     smartLists: true,
//     smartypants: true 
//   });	
//   let path = window.location.pathname;
//   let page = (path === '/' || path.endsWith('/index.html') || path === '') ? 'default' : path.substring(1);
//   page = page.split('/')[0] || 'default';

//   try {
//     const res = await fetch(`./assets/${page}.md`);
//     if (!res.ok) throw new Error('Not found');
//     const mdText = await res.text();
//     contentDiv.innerHTML = marked.parse(mdText);
//   } catch (err) {
//     contentDiv.innerHTML = `<h2>Page Not Found</h2>`;
//   }
// }


/*
$(function() {
  marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    headerIds: true,
    mangle: true,
    highlight: function(code, lang) {
      if (window.hljs && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, code).value;
      }
      return code;
    }
  });

  function loadMarkdown(section) {
    const mdPath = `assets/${section}.md`;
    $.get(mdPath)
      .done(function(raw) {
        const html = marked.parse(raw);
        $('#posts').html(html);
        $('#posts img').css({ 'max-width': '100%', 'height': 'auto' });
        $('#posts table').css({ 'max-width': '100%', 'overflow-x': 'auto', 'display': 'block' });
      })
      .fail(function() {
        $('#posts').html('<p>Failed to load content :(</p>');
      });
  }

  $('#menu li').on('click', function() {
    const section = $(this).data('section');
    if (section) loadMarkdown(section);
  });

  loadMarkdown('default');
});


*/

$(document).ready(function() {
  marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    headerIds: true,
    mangle: true
  });

  function loadMarkdown(path) {
    $('#posts').empty().append('<p>Loading...</p>');
    $.get(path, function(content) {
      $('#posts').html(marked().parse(content));
    }).fail(function() {
      $('#posts').html('<p>Failed to load content.</p>');
    });
  }

  function loadPosts() {
    $('#posts').empty().append('<p>Loading posts...</p>');

    $.get('/assets/posts/', function(indexHtml) {
      const $links = $(indexHtml).find('a[href$=".md"]');
      const files = [];
      $links.each(function() {
        let href = $(this).attr('href');
        href = href.replace(/^\.\//, '');
        files.push(href);
      });

      const uniqueFiles = Array.from(new Set(files));

      const requests = uniqueFiles.map(file =>
        $.get('/assets/posts/' + file).then(content => {
          const lines = content.split(/\r?\n/);
          const dateLine = lines.find(l => /^date\s*:\s*\d{4}\/\d{2}\/\d{2}/i) || '';
          const dateMatch = dateLine.match(/(\d{4})\/(\d{2})\/(\d{2})/);
          const date = dateMatch
            ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
            : '0000-00-00';

          const descLine = lines.find(l => /^description\s*:/i) || '';
          let desc = descLine.replace(/^description\s*:\s*/i, '').trim();
          const maxLen = 80;
          if (desc.length > maxLen) {
            desc = desc.substring(0, maxLen) + '...';
          }

          const title = file.replace(/\.md$/i, '');

          return { title, date, desc };
        })
      );

      $.when(...requests).done(function() {
        const items = Array.from(arguments);

        items.sort((a, b) => new Date(b.date) - new Date(a.date));

        let table = '<table class="styled-table">';
        table += '<thead><tr><th>Title</th><th>Date</th><th>Description</th></tr></thead><tbody>';
        items.forEach(item => {
          table += `<tr>
                      <td>${item.title}</td>
                      <td>${item.date}</td>
                      <td>${item.desc}</td>
                    </tr>`;
        });
        table += '</tbody></table>';

        $('#posts').html(table);
      });
    }).fail(function() {
      $('#posts').html('<p>Failed to load posts directory.</p>');
    });
  }

  loadMarkdown('assets/default.md');

  $('#menu li').on('click', function() {
    const section = $(this).data('section');
    switch (section) {
      case 'aboutme':
        loadMarkdown('assets/aboutme.md');
        break;
      case 'history':
        loadMarkdown('assets/history.md');
        break;
      case 'projects':
        loadMarkdown('assets/projects.md');
        break;
      case 'posts':
        loadPosts();
        break;
      default:
        loadMarkdown('assets/default.md');
    }
  });
});
