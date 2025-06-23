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
    //ctx.translate(0.5, 0.5);
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
      $('#posts').html(marked.parse(content));
    }).fail(function() {
      $('#posts').html('<p>Failed to load content.</p>');
    });
  }
  function loadPosts() {
    $('#posts').html('<p>Loading posts...</p>');
    const apiUrl = 'https://api.github.com/repos/dretoh/dretoh.github.io/contents/assets/posts';

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error('GitHub API error: ' + res.status);
        return res.json();
      })
      .then(files => {
        const mdFiles = files.filter(f => f.name.endsWith('.md'));
        return Promise.all(mdFiles.map(f =>
          fetch(f.download_url)
            .then(r => {
              if (!r.ok) throw new Error(`Failed to fetch ${f.name}`);
              return r.text();
            })
            .then(content => {
              const allLines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
              const header = allLines.slice(0, 4).map(l => l.trim());

              const dateLine = header.find(l => /^date\s*:/i.test(l)) || '';
              const dm = dateLine.match(/(\d{4})\/(\d{2})\/(\d{2})/);
              const date = dm ? `${dm[1]}-${dm[2]}-${dm[3]}` : '';

              const descLine = header.find(l => /^description\s*:/i.test(l)) || '';
              let desc = descLine.replace(/^description\s*:\s*/i, '').trim();
              if (desc.length > 80) desc = desc.slice(0, 80) + '...';

              return {
                title: f.name.replace(/\.md$/i, ''),
                date,
                desc,
                url: f.download_url,  
              };
            })
        ));
      })
      .then(items => {
        items.sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '<table class="styled-table">';
        html += '<thead><tr><th>Title</th><th>Date</th><th>Description</th></tr></thead>';
        html += '<tbody>';
        items.forEach(item => {
          html += `
            <tr class="post-row hover_up" data-url="${item.url}">
              <td>${item.title}</td>
              <td>${item.date}</td>
              <td>${item.desc}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        $('#posts').html(html);

        $('.post-row').on('click', function() {
          const $this = $(this);
          if ($this.next().hasClass('post-details')) {
            $this.next().remove();
            return;
          }
          const url = $this.data('url');
          const colspan = $this.children('td').length;
          const $detailsRow = $(`
            <tr class="post-details">
              <td colspan="${colspan}">
                <div class="post-content">Loading full markdown…</div>
              </td>
            </tr>
          `);
          $this.after($detailsRow);

          fetch(url)
            .then(r => {
              if (!r.ok) throw new Error('Failed to fetch full markdown');
              return r.text();
            })
            .then(md => {
              const lines = md.replace(/^\uFEFF/, '').split(/\r?\n/);
              const body = lines.slice(2).join('\n');

              $detailsRow.find('.post-content').html(marked.parse(body));
            })
            .catch(() => {
              $detailsRow.find('.post-content').text('Failed to load content.');
            });
        });
      })
      .catch(err => {
        console.error(err);
        $('#posts').html('<p>Failed to load posts.</p>');
      });
  }

  loadMarkdown('assets/default.md');

  $('#menu li').on('click', function() {
    const section = $(this).data('section');
    switch (section) {
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

$(document).ready(function() {
  $('[data-section="history"]').on('click', function() {
    $('#timeline').empty(); 
    var timeline = $('#timeline');

    var events = [
      'Started studying Computer Engineering.',
      'Developed a plugin for Minecraft.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'Contributed to an open-source security project.',
      'Learned system security and network security.aaaaaaaaaaaaaaaaaaaaaaaaaa'
    ];

    function createArrowBox(content, position) {
      
      var arrowBox = $('<div>', { class: 'arrow-box' });
      var arrow = $('<div>', { class: 'arrow' });
      var description = $('<div>', { class: 'description' }).text(content);

      arrowBox.css({
        'text-align': 'center',
        'display': 'inline-block',
        'position': 'relative',
        'margin': '20px 0',
        'width': '100%',
        'max-width': '600px',
        'border-radius': '10px'
      });

      arrow.css({
        'width': '0',
        'height': '0',
        'border-left': '20px solid transparent',
        'border-right': '20px solid transparent',
        'border-top': '30px solid green',
        'margin': '0 auto'
      });

      description.css({
        'padding': '20px',
        'background-color': 'white',
        'border': '2px solid #ccc',
        'border-radius': '10px',
        'margin': '10px'
      });

      if (position === 'left') {
        description.css('background-color', 'lightgreen');
        arrowBox.append(arrow);
        arrowBox.append(description);
      } else {
        description.css('background-color', 'lightgrey');
        arrowBox.append(description);
        arrowBox.append(arrow);
      }
      return arrowBox;
    }

    events.forEach(function(event, index) {
      var position = index % 2 === 0 ? 'left' : 'right';
      var arrowBox = createArrowBox(event, position);
      timeline.append(arrowBox);
    });
  });
});
