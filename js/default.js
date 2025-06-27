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

function startshow() {
  var table = $('.slideshow');
  var tr = table.find('tr');
  var tds = tr.children('td');
  var tdArray = [];
  var timer;
  tds.each(function(index) {
    tdArray.push($(this));
    setTimeout(function() {
      tr.append($(tdArray[index]));
    }, index * 500);
  });

  function slideshow() {
    if (tdArray.length > 0) {
      var firstTd = tdArray.shift();
      firstTd.fadeOut(500, function() {
        tr.append(firstTd.fadeIn(500));
      });
    }
  }

  function startSlideshow() {
    timer = setInterval(slideshow, 5000); 
  }
  function stopSlideshow(){
    clearInterval(timer);
  }
  startSlideshow();

  $('.slideshow').hover(stopSlideshow,startSlideshow);
}


window.addEventListener('DOMContentLoaded', function(){ 
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
      if (path === 'assets/history.md') {
        createTimeline();
      }
      if (path === 'assets/default.md') {
        startshow();
      }     
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

function createTimeline() {
  const styleContent = `
    #timeline { width: 90%; margin: 0 auto; }
    .timeline-row { margin: 20px 0; }
    .green-box {
      width: 100%;
      height: 20px;
      background-color: #e6f4ea;
      position: relative;
      display: flex;
      border-radius: 10px;
      align-items: center; /*세로 중앙 정*/
      justify-content: center; /*수평 중앙 정렬*/
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .green-box:hover { background-color: #d0e8d4; }

    .year-box {
      background-color: #fff;
      border: 2px solid #e6f4ea;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      padding: 0;
      font-weight: bold;
      transform: translateY(-5%);

    }
    .details {
      display: none;
      margin: 8px 0 0 0;
      padding: 0 10px;
      text-align: left;
    }
    .details ul {
      list-style: disc inside;
      margin: 0;
      padding: 0;
    }
    .details li {
      margin: 4px 0;
    }
  `;
  if (!$('#timeline-styles').length) {
    $('<style>', { id: 'timeline-styles' })
      .text(styleContent)
      .appendTo('head');
  }

  const timeline = $('#timeline');
  if (!timeline.length) return;
  timeline.empty();

  const events = [
    '[2015–2017]\r\ntest',
    '[2022–2023]\r\ntest2',
    '[2024]\r\nrunning20\r\ntest2\r\ntest',
    '[2024]\r\ntest2024\r\nCS-2024',
    '[2025]\r\nInterntest\r\n tets'
  ];

  events.forEach(text => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    const year = lines[0].replace(/^\[|\]$/g, '');
    const details = lines.slice(1);

    const row = $('<div>').addClass('timeline-row');
    const greenBox = $('<div>').addClass('green-box');
    const yearBox = $('<div>').addClass('year-box').text(year);
    const detailsBox = $('<div>').addClass('details');
    const ul = $('<ul>');

    details.forEach(item => ul.append($('<li>').text(item)));
    detailsBox.append(ul);

    greenBox.append(yearBox);
    row.append(greenBox, detailsBox);
    timeline.append(row);

    greenBox.hover(
      () => detailsBox.stop(true,true).slideDown(300),
      () => detailsBox.stop(true,true).slideUp(200)
    );
  });
}

