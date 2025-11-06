// Year stamps
[...document.querySelectorAll('[id^="year-"], #year, #year-home')].forEach(el=>el.textContent=new Date().getFullYear());

// Header wordmark (violet→teal)
(function(){
  const brand = document.querySelector('.brand'); if(!brand) return;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" aria-hidden="true" style="display:inline-block;vertical-align:middle">
      <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs>
      <circle cx="128" cy="128" r="96" fill="none" stroke="url(#g)" stroke-width="20"/>
      <path d="M70 114c0-26 23-44 53-44 20 0 37 8 48 21" fill="none" stroke="#e6eaf2" stroke-width="18" stroke-linecap="round"/>
      <path d="M70 142c11 13 28 21 48 21 30 0 53-18 53-44" fill="none" stroke="#e6eaf2" stroke-width="18" stroke-linecap="round"/>
    </svg>`;
  const dot = brand.querySelector('.dot'); if(dot) dot.remove();
  brand.insertAdjacentHTML('afterbegin', svg);
})();

// Theme toggle with persistence
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const setTheme = t => { root.setAttribute('data-theme', t); localStorage.setItem('theme', t); };
  setTheme(saved || (prefersLight ? 'light' : 'dark'));
  const navBar = document.querySelector('.nav');
  if(navBar){
    const btn = document.createElement('button');
    btn.id = 'theme-toggle'; btn.type = 'button';
    btn.setAttribute('aria-label','Toggle color theme');
    btn.style.cssText = 'margin-left:auto;border:1px solid rgba(148,163,184,.25);padding:.45rem .6rem;border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.12));color:inherit;cursor:pointer';
    const icon = () => (root.getAttribute('data-theme')==='light' ? '🌙' : '☀️');
    btn.textContent = icon();
    btn.addEventListener('click',()=>{ const next = root.getAttribute('data-theme')==='light'?'dark':'light'; setTheme(next); btn.textContent = icon(); });
    navBar.appendChild(btn);
  }
})();

// Email obfuscation (data-user + data-domain)
(function(){
  document.querySelectorAll('[data-user][data-domain]').forEach(el=>{
    const addr = `${el.getAttribute('data-user')}@${el.getAttribute('data-domain').replace('(dot)','.')}`;
    el.textContent = addr; el.href = 'mailto:'+addr;
  });
})();

// Projects feed → cards
(function(){
  const grids = document.querySelectorAll('#projects-grid, .projects-grid');
  grids.forEach(grid => {
    const src = grid.getAttribute('data-src') || '/assets/data/projects.json';
    fetch(src).then(r=>r.json()).then(items=>{
      grid.innerHTML = items.map(item=>`
        <article class="card pad">
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          ${item.tags ? `<p class="subtext">${item.tags.join(' • ')}</p>` : ''}
          ${item.url ? `<a class="btn" href="${item.url}">Open</a>` : ''}
        </article>
      `).join('');
    }).catch(()=>{ grid.innerHTML = '<p class="subtext">Could not load projects right now.</p>'; });
  });
})();

// Sitemap generator (download)
(function(){
  function buildSitemap(){
    const origin = (location.origin || 'https://<your-username>.github.io');
    const hrefs = Array.from(document.querySelectorAll('a[href^="/"]'))
      .map(a=> new URL(a.getAttribute('href'), origin).href)
      .filter(u=>!u.includes('#'));
    const unique = Array.from(new Set(['/','/about.html','/experience.html','/case-studies/','/teaching-speaking/','/publications/','/contact.html', ...hrefs].map(u=> new URL(u, origin).href)));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      unique.map(u=>`  <url><loc>${u}</loc></url>`).join('\n') + `\n</urlset>`;
    const blob = new Blob([xml], {type:'application/xml'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sitemap.xml'; a.click(); URL.revokeObjectURL(a.href);
  }
  const foot = document.querySelector('footer .container, .site-foot');
  if(foot){ const link = document.createElement('a'); link.href='#'; link.textContent='Generate sitemap.xml'; link.style.marginLeft='1rem'; link.addEventListener('click', e=>{e.preventDefault(); buildSitemap();}); const p = foot.querySelector('p'); (p||foot).appendChild(link); }
})();