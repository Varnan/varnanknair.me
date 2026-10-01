/* Varnan Kanjhinghat — portfolio interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preloader ---------- */
  // Resolves when the preloader has gone, so intro animations play in view.
  const introReady = new Promise(resolve => {
    const pre = $('#preloader');
    if (!pre || getComputedStyle(pre).display === 'none') return resolve();
    const fill = $('#pl-fill'), pct = $('#pl-pct'), step = $('#pl-step');
    const steps = ['booting portfolio', 'loading projects', 'compiling skills', 'deploying to varnanknair.me'];
    let seen = false;
    try { seen = sessionStorage.getItem('vk-seen') === '1'; sessionStorage.setItem('vk-seen', '1'); } catch (e) {}
    const minTime = seen ? 350 : 1400;
    const t0 = performance.now();
    let loaded = document.readyState === 'complete';
    addEventListener('load', () => { loaded = true; });
    let p = 0;
    const tick = () => {
      const elapsed = performance.now() - t0;
      const target = loaded ? 100 : Math.min(90, (elapsed / minTime) * 90);
      const cap = Math.min(100, (elapsed / minTime) * 100);
      p = Math.min(Math.max(p, Math.min(target, cap)), 100);
      pre.style.setProperty('--p', p.toFixed(1));
      fill.style.setProperty('--p', p.toFixed(1));
      pct.textContent = Math.round(p);
      step.textContent = steps[Math.min(steps.length - 1, Math.floor(p / 26))];
      if (p >= 100) {
        setTimeout(() => { pre.classList.add('done'); resolve(); setTimeout(() => pre.remove(), 1000); }, 180);
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { loaded = true; }, 5000); // slow network: don't hold the page hostage
  });

  /* ---------- nav: mobile menu, scrolled state, active link ---------- */
  const nav = $('.nav');
  const menu = $('.menu');
  const links = $('#site-nav');
  menu.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    menu.setAttribute('aria-expanded', false);
  }));
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('a[href^="/"]:not(.nav-cta)', links);

  /* ---------- clean URLs: /work, /contact ... and plain / for home ---------- */
  const SECTIONS = ['work', 'services', 'skills', 'ai', 'experience', 'about', 'contact'];
  const TITLES = { work: 'Work', services: 'Services', skills: 'Skills', ai: 'AI & Data', experience: 'Experience', about: 'About', contact: 'Contact' };
  const baseTitle = document.title;
  const pathFor = id => (SECTIONS.includes(id) ? '/' + id : '/');
  let current = 'home';
  let autoScrolling = false;
  let routerReady = false; // ignore the scroll-spy until any deep link has been scrolled to

  const setRoute = (id, push) => {
    if (id === current && !push) return;
    current = id;
    const url = pathFor(id);
    if (location.pathname + location.search + location.hash !== url) history[push ? 'pushState' : 'replaceState']({ id }, '', url);
    document.title = TITLES[id] ? `${TITLES[id]} · Varnan Kanjhinghat` : baseTitle;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === url && url !== '/'));
  };
  const goTo = (id, smooth = true) => {
    const behavior = smooth && !reduceMotion ? 'smooth' : 'instant';
    const el = SECTIONS.includes(id) && document.getElementById(id);
    autoScrolling = true;
    if (el) el.scrollIntoView({ behavior }); else scrollTo({ top: 0, behavior });
    setTimeout(() => { autoScrolling = false; }, smooth ? 900 : 50);
  };

  // Intercept internal links (/, /work, /contact, ...)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="/"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const id = a.getAttribute('href').slice(1) || 'home';
    if (id !== 'home' && !SECTIONS.includes(id)) return;
    e.preventDefault();
    setRoute(id, true);
    goTo(id);
  });
  addEventListener('popstate', () => {
    const id = location.pathname.replace(/^\/|\/$/g, '') || 'home';
    current = id; goTo(id); setRoute(id, false);
  });

  // Keep the URL in sync with the section being read
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting && routerReady && !autoScrolling) setRoute(e.target.id, false); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(sec => spy.observe(sec));

  // Deep links: /work (via the stub page -> /?s=work), old-style /#work, or plain /
  const params = new URLSearchParams(location.search);
  const startId = params.get('s') || location.hash.slice(1) || location.pathname.replace(/^\/|\/$/g, '');
  if (SECTIONS.includes(startId)) {
    history.replaceState({ id: startId }, '', '/' + startId);
    current = startId;
    document.title = `${TITLES[startId]} · Varnan Kanjhinghat`;
  } else if (location.hash === '#home' || params.has('s')) {
    history.replaceState({ id: 'home' }, '', '/');
  }

  /* ---------- scroll reveal (starts once the preloader has cleared) ---------- */
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
    });
  }, { threshold: .12 });
  introReady.then(() => {
    if (current !== 'home') goTo(current, false);
    setTimeout(() => { routerReady = true; }, 150);
  });
  introReady.then(() => $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    revealer.observe(el);
  }));

  /* ---------- hero: typing terminal + counters + card tilt ---------- */
  const typed = $('.terminal .o');
  if (typed) {
    const text = typed.dataset.type;
    if (reduceMotion) typed.textContent = text;
    else {
      let i = 0;
      const tick = () => { typed.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 38); };
      introReady.then(() => setTimeout(tick, 700));
    }
  }

  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    if (reduceMotion) { el.textContent = end; return; }
    const start = performance.now();
    const step = t => {
      const p = Math.min((t - start) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    introReady.then(() => setTimeout(() => requestAnimationFrame(step), 500));
  });

  const card = $('.hero-card');
  if (card && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg)`;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  /* cursor spotlight on service cards */
  $$('.service').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------- work filters ---------- */
  const workChips = $$('#work .filters .chip');
  workChips.forEach(chip => chip.addEventListener('click', () => {
    workChips.forEach(c => { c.classList.toggle('active', c === chip); c.setAttribute('aria-selected', c === chip); });
    const f = chip.dataset.filter;
    $$('.work, #work .archive').forEach(w => w.classList.toggle('hide', f !== 'all' && w.dataset.cat !== f));
  }));

  /* ---------- skills: periodic table ---------- */
  const CATS = {
    backend:  { label: 'Backend',          c: '#eeb07a' },
    ai:       { label: 'AI & Data',        c: '#9ad7e0' },
    frontend: { label: 'Frontend & Web',   c: '#f7d2a8' },
    cloud:    { label: 'Cloud & DevOps',   c: '#d98b52' },
    data:     { label: 'Data',             c: '#c9a27e' },
    quality:  { label: 'Quality',          c: '#8fd0c1' },
    design:   { label: 'Branding & Design', c: '#f3c08e' },
    ways:     { label: 'Ways of working',  c: '#a8bbb8' },
  };
  // [symbol, name, category, level 0-100, note, core?]
  const SKILLS = [
    ['Py', 'Python', 'backend', 96, 'My primary language since 2013. Used at Tesco Mobile, Kuliza, Raybaby, Shadowfax, Cognalys and Inzane.', 1],
    ['Dj', 'Django', 'backend', 96, 'Production Django for 13+ years: telecom at Tesco Mobile, BFSI (UTI Mutual Fund, Bharti AXA Life), IoT and logistics.', 1],
    ['Rf', 'Django REST', 'backend', 92, 'API-first backends with Django REST Framework, serving mobile apps, devices and partner integrations.', 1],
    ['Ap', 'REST APIs', 'backend', 94, 'API design and architecture for high-traffic systems, including real-time reporting APIs at Cognalys.', 1],
    ['Ce', 'Celery', 'backend', 85, 'Background jobs and scheduled pipelines for Raybaby device data.'],
    ['Rd', 'Redis', 'backend', 84, 'Caching, queues and pub/sub for IoT and logistics workloads.'],
    ['Rq', 'RabbitMQ', 'backend', 72, 'Message brokering for distributed task processing.'],
    ['Mq', 'MQTT', 'backend', 82, 'Configured and coded the MQTT server layer for Raybaby device connectivity.'],
    ['Co', 'GitHub Copilot', 'ai', 90, 'In-editor AI pair programming for Python/Django, APIs and tests.', 1],
    ['Cc', 'Claude Code', 'ai', 88, 'Agentic AI coding: multi-file refactors, test generation and codebase exploration.', 1],
    ['Gp', 'ChatGPT / Codex', 'ai', 88, 'Debugging, code generation, documentation and design reviews.'],
    ['Tn', 'Tabnine', 'ai', 80, 'AI code completion in day-to-day development.'],
    ['Mc', 'MS Copilot', 'ai', 82, 'AI productivity across Microsoft 365: summaries, docs and analysis.'],
    ['Pe', 'Prompt engineering', 'ai', 85, 'Writing precise prompts and context so AI tools produce reliable, reviewable code.'],
    ['Pd', 'Pandas / DataFrames', 'ai', 78, 'Prepared Raybaby device data with DataFrames for AI model training.'],
    ['Bd', 'Big data', 'ai', 78, 'High-volume IoT sensor streams ingested and processed at Raybaby.'],
    ['Ai', 'AI predictions', 'ai', 76, 'Integrated sleep and breathing prediction algorithms with the DSP engineers at Raybaby.'],
    ['Ht', 'HTML5', 'frontend', 90, 'Semantic, accessible markup for every client website.'],
    ['Cs', 'CSS3', 'frontend', 88, 'Responsive, modern layouts using grid, flexbox and animation, like this site.'],
    ['Js', 'JavaScript', 'frontend', 82, 'Interactive UI, form handling and animations without heavy frameworks.'],
    ['Jq', 'jQuery', 'frontend', 80, 'Legacy dashboards and CMS-driven sites.'],
    ['Rw', 'Responsive design', 'frontend', 90, 'Mobile-first builds, as on Aishwarya Homestay and MARC Reading.'],
    ['Se', 'SEO', 'frontend', 82, 'Technical SEO, meta and structured data, sitemaps and performance, as on Z2 Biopharma.'],
    ['Dk', 'Docker', 'cloud', 88, 'Containerised services day to day at Tesco Mobile.', 1],
    ['K8', 'Kubernetes', 'cloud', 82, 'Deploying and operating Python services on Kubernetes at Tesco Mobile.', 1],
    ['Aw', 'AWS', 'cloud', 85, 'EC2, Elastic Load Balancer and more. Raybaby and Shadowfax ran on AWS.'],
    ['Az', 'Azure', 'cloud', 74, 'BFSI deployments for UTI Mutual Fund and Bharti AXA Life at Kuliza.'],
    ['Nx', 'Nginx', 'cloud', 86, 'Reverse proxy and SSL for Django apps with uWSGI.'],
    ['Uw', 'uWSGI', 'cloud', 84, 'Production app serving for Django since 2013.'],
    ['Lx', 'Linux / RHEL', 'cloud', 84, 'Server configuration and administration on Ubuntu and Red Hat.'],
    ['Jk', 'Jenkins', 'cloud', 72, 'CI pipelines for build, test and deploy.'],
    ['An', 'Ansible', 'cloud', 68, 'Automated provisioning and deployments.'],
    ['Dn', 'Domains & DNS', 'cloud', 90, 'Domains, DNS, SSL and business email for every client launch.'],
    ['Pg', 'PostgreSQL', 'data', 90, 'Primary database for most Django platforms I have built.', 1],
    ['My', 'MySQL', 'data', 84, 'Web apps and legacy systems.'],
    ['Ms', 'SQL Server', 'data', 72, 'Enterprise BFSI integrations.'],
    ['Mg', 'MongoDB', 'data', 72, 'Document storage for device and event data.'],
    ['Sq', 'SQLite', 'data', 80, 'Prototypes, tooling and tests.'],
    ['Ut', 'Unit testing', 'quality', 88, 'Test-first changes and coverage gates on Tesco Mobile services.', 1],
    ['Li', 'Linting', 'quality', 88, 'Automated linting and code-quality checks in CI.'],
    ['Sn', 'Sentry', 'quality', 78, 'Error monitoring and alerting in production at Raybaby.'],
    ['Cr', 'Code review', 'quality', 90, 'Reviewing and mentoring across teams as a lead developer.'],
    ['Lo', 'Logo design', 'design', 80, 'Brand marks for businesses, including my own VK monogram.'],
    ['Vc', 'Visiting cards', 'design', 84, 'Print-ready business cards that match the brand and website.'],
    ['Lh', 'Letterheads', 'design', 80, 'Corporate stationery and document templates.'],
    ['Cv', 'Canva', 'design', 86, 'Brand assets, social graphics and print layouts, including Canva AI features.'],
    ['Ui', 'UI design', 'design', 80, 'Clean, conversion-focused web interfaces.'],
    ['Gt', 'Git', 'ways', 92, 'Daily. Branching strategies, reviews and release flows.'],
    ['Ag', 'Agile / Jira', 'ways', 88, 'Scrum and Kanban delivery with Jira and Trello.'],
    ['Ld', 'Tech leadership', 'ways', 88, 'Leading a large-scale platform migration at Tesco Mobile. Previously led the Raybaby backend team.', 1],
  ];

  const table = $('#periodic');
  const filterBar = $('.skill-filters');
  const detail = $('#skill-detail');

  const chip = (key, label) => {
    const b = document.createElement('button');
    b.className = 'chip' + (key === 'all' ? ' active' : '');
    b.dataset.cat = key;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', key === 'all');
    b.textContent = label;
    return b;
  };
  filterBar.append(chip('all', 'All'), chip('core', 'Core stack'), ...Object.entries(CATS).map(([k, v]) => chip(k, v.label)));

  table.innerHTML = SKILLS.map(([sym, name, cat, lvl, , core], i) => `
    <div class="el${core ? ' core' : ''}" tabindex="0" data-i="${i}" data-cat="${cat}" style="--i:${i};--c:${CATS[cat].c}">
      <span class="n">${String(i + 1).padStart(2, '0')}<i></i></span>
      <span class="s">${sym}</span>
      <span class="l">${name}</span>
    </div>`).join('');

  const show = i => {
    const [sym, name, cat, lvl, note] = SKILLS[i];
    $('.sd-sym', detail).textContent = sym;
    $('.sd-cat', detail).textContent = CATS[cat].label;
    $('.sd-name', detail).textContent = name;
    $('.sd-note', detail).textContent = note;
    $('.sd-bar i', detail).style.setProperty('--w', lvl + '%');
    $('.sd-years', detail).textContent = `Proficiency · ${lvl}/100`;
  };
  show(0);

  $$('.el', table).forEach(el => {
    const i = +el.dataset.i;
    el.addEventListener('pointerenter', () => show(i));
    el.addEventListener('focus', () => show(i));
  });

  filterBar.addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('.chip', filterBar).forEach(c => { c.classList.toggle('active', c === b); c.setAttribute('aria-selected', c === b); });
    const f = b.dataset.cat;
    let first = null;
    $$('.el', table).forEach(el => {
      const i = +el.dataset.i;
      const match = f === 'all' || (f === 'core' ? SKILLS[i][5] : el.dataset.cat === f);
      el.classList.toggle('dim', !match);
      if (match && first === null) first = i;
    });
    if (first !== null) show(first);
  });

  table.addEventListener('pointermove', e => {
    const r = table.getBoundingClientRect();
    table.style.setProperty('--mx', `${e.clientX - r.left + 20}px`);
    table.style.setProperty('--my', `${e.clientY - r.top + 20}px`);
  });
  table.addEventListener('pointerleave', () => {
    table.style.setProperty('--mx', '-500px');
    table.style.setProperty('--my', '-500px');
  });

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const label = $('span', btn);
    try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = 'Copied!'; }
    catch (e) { location.href = 'mailto:' + btn.dataset.copy; return; }
    btn.classList.add('copied');
    setTimeout(() => { label.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  }));

  $('#year').textContent = new Date().getFullYear();
})();
