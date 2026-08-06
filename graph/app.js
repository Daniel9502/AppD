/* =====================================================================
   Explorator de graf: peste graph.json produs de Graphify
   Vanilla JS, zero dependințe, zero cereri externe. Fișierul e citit local.

   Cuprins:
     1. Ajutoare            7. Randare
     2. Stare & culori      8. Interacțiune (pan / zoom / hover / drag)
     3. Încărcare date      9. Panouri (filtre, hub-uri, detalii)
     4. Model              10. Căutare
     5. Quadtree           11. Drum minim
     6. Simulare           12. Pornire
   ===================================================================== */
(() => {
  'use strict';

  /* ======================= 1. Ajutoare ======================= */

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const jiggle = () => (Math.random() - 0.5) * 1e-6;
  /* fără diacritice și fără majuscule, ca să meargă căutarea „fisiere” pe „Fișiere” */
  const COMBINING = /[\u0300-\u036f]/g;
  const fold = (s) => s.normalize('NFD').replace(COMBINING, '').toLowerCase();

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KIND_RO = { code: 'cod', document: 'document', concept: 'concept' };

  /* ======================= 2. Stare & culori ======================= */

  const S = {
    nodes: [], links: [],
    byId: new Map(),
    adj: new Map(),              // id -> [{ other, link, out }]
    communities: [],             // { id, name, count, color }
    relations: [], kinds: [],
    filters: { com: new Set(), rel: new Set(), kind: new Set(), inferredOnly: false },
    view: { x: 0, y: 0, k: 1 },
    hover: null, selected: null,
    pathA: null, pathB: null, path: null,   // path = { nodes:Set, links:Set, len:number }
    commit: '', sourceName: '',
    loaded: false,
  };

  const C = {};                  // culorile curente, citite din CSS
  const SERIES_SLOTS = 8;        // atât are paleta; comunitatea a 9-a intră în „Altele”

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const get = (n) => cs.getPropertyValue(n).trim();
    C.series = [];
    for (let i = 1; i <= SERIES_SLOTS; i++) C.series.push(get('--series-' + i));
    C.other   = get('--series-other');
    C.surface = get('--surface');
    C.ink     = get('--ink');
    C.ink2    = get('--ink-2');
    C.muted   = get('--muted');
    C.rule    = get('--rule');
    C.grid    = get('--grid');
    C.accent  = get('--accent');
    for (const c of S.communities) c.color = colorForSlot(c.slot);
  }

  const colorForSlot = (slot) => (slot < 0 ? C.other : C.series[slot]);

  /* ---- temă ---- */
  const THEME_KEY = 'graf-tema';

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem(THEME_KEY, mode); } catch (_) {}
    readColors();
    paintLegend();
    requestDraw();
  }

  function initTheme() {
    let mode = null;
    try { mode = localStorage.getItem(THEME_KEY); } catch (_) {}
    if (mode !== 'light' && mode !== 'dark') {
      mode = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(mode);
  }

  /* ======================= 3. Încărcare date ======================= */

  const DEFAULT_GRAPH = '../graphify-out/graph.json';

  async function loadFromUrl(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    ingest(json, url.split('/').filter(Boolean).slice(-2).join('/'));
  }

  function loadFromFile(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        ingest(JSON.parse(fr.result), file.name);
      } catch (err) {
        showDropzone('Fișierul nu e un JSON valid', String(err && err.message || err));
      }
    };
    fr.onerror = () => showDropzone('Nu am putut citi fișierul', 'Încearcă din nou.');
    fr.readAsText(file);
  }

  function ingest(json, name) {
    const rawNodes = json.nodes || [];
    const rawLinks = json.links || json.edges || [];
    if (!Array.isArray(rawNodes) || !rawNodes.length) {
      showDropzone('Graf gol', 'JSON-ul nu conține niciun nod.');
      return;
    }
    buildModel(rawNodes, rawLinks, json);
    S.sourceName = name;
    S.loaded = true;
    $('#source-name').textContent = `${name} · ${S.nodes.length} noduri`;
    $('#dropzone').hidden = true;

    buildPanels();
    resetLayout();
    settle();
    fitView(false);
    requestDraw();
  }

  function showDropzone(title, msg) {
    const dz = $('#dropzone');
    dz.hidden = false;
    if (title) $('#dz-title').textContent = title;
    if (msg) $('#dz-msg').textContent = msg;
    $('#source-name').textContent = 'niciun graf încărcat';
  }

  /* ======================= 4. Model ======================= */

  function buildModel(rawNodes, rawLinks, json) {
    S.byId = new Map();
    S.nodes = rawNodes.map((r, i) => {
      const id = String(r.id != null ? r.id : r.label != null ? r.label : i);
      const n = {
        id, index: i,
        label: String(r.label != null ? r.label : id),
        kind: r.file_type || 'code',
        file: r.source_file || '',
        loc: r.source_location || '',
        origin: r._origin || '',
        com: r.community != null ? r.community : -1,
        comName: r.community_name || '',
        x: 0, y: 0, vx: 0, vy: 0, fx: null, fy: null,
        deg: 0, r: 4,
        search: '',
      };
      n.search = fold(n.label + ' ' + n.file);
      S.byId.set(id, n);
      return n;
    });

    /* muchiile care trimit spre noduri inexistente sunt ignorate, nu inventate */
    S.links = [];
    for (const r of rawLinks) {
      const s = S.byId.get(String(r.source));
      const t = S.byId.get(String(r.target));
      if (!s || !t || s === t) continue;
      S.links.push({
        source: s, target: t,
        rel: r.relation || 'link',
        inferred: (r.confidence || '').toUpperCase() === 'INFERRED',
        conf: r.confidence_score != null ? r.confidence_score : null,
        context: r.context || '',
        loc: r.source_location || '',
        file: r.source_file || '',
      });
    }

    /* grade + vecinătăți */
    S.adj = new Map();
    for (const n of S.nodes) S.adj.set(n.id, []);
    for (const l of S.links) {
      l.source.deg++; l.target.deg++;
      S.adj.get(l.source.id).push({ other: l.target, link: l, out: true });
      S.adj.get(l.target.id).push({ other: l.source, link: l, out: false });
    }
    for (const n of S.nodes) n.r = 3.6 + Math.sqrt(n.deg) * 2.5;

    /* comunități: cele mai mari 8 primesc culoare, restul intră în „Altele” */
    const byCom = new Map();
    for (const n of S.nodes) {
      let c = byCom.get(n.com);
      if (!c) byCom.set(n.com, c = { id: n.com, name: n.comName || `Comunitatea ${n.com}`, count: 0 });
      c.count++;
      if (!c.name && n.comName) c.name = n.comName;
    }
    S.communities = [...byCom.values()].sort((a, b) => b.count - a.count || String(a.id).localeCompare(String(b.id)));
    S.communities.forEach((c, i) => {
      c.slot = i < SERIES_SLOTS ? i : -1;
      c.color = colorForSlot(c.slot);
    });
    const comColor = new Map(S.communities.map((c) => [c.id, c]));
    for (const n of S.nodes) n.comRef = comColor.get(n.com);

    /* relații & tipuri, ordonate după frecvență */
    const tally = (arr, key) => {
      const m = new Map();
      for (const x of arr) m.set(x[key], (m.get(x[key]) || 0) + 1);
      return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    };
    S.relations = tally(S.links, 'rel');
    S.kinds = tally(S.nodes, 'kind');

    S.filters.com = new Set(S.communities.map((c) => c.id));
    S.filters.rel = new Set(S.relations.map((r) => r.name));
    S.filters.kind = new Set(S.kinds.map((k) => k.name));
    S.filters.inferredOnly = false;

    S.commit = json.built_at_commit ? String(json.built_at_commit).slice(0, 8) : '';
    S.selected = S.hover = S.pathA = S.pathB = S.path = null;
  }

  /* ---- ce se vede, după filtre ---- */
  const nodeVisible = (n) => S.filters.com.has(n.com) && S.filters.kind.has(n.kind);
  const linkVisible = (l) =>
    S.filters.rel.has(l.rel) &&
    (!S.filters.inferredOnly || l.inferred) &&
    nodeVisible(l.source) && nodeVisible(l.target);

  /* ======================= 5. Quadtree (Barnes-Hut) ======================= */
  /* Toate nodurile au aceeași sarcină, deci e destul să numărăm punctele:
     centrul de masă e media simplă, iar masa e count × charge. */

  const MAX_DEPTH = 20;
  const qtNew = (x0, y0, x1, y1) => ({ x0, y0, x1, y1, kids: null, items: null, count: 0, cx: 0, cy: 0 });

  function qtPick(q, n) {
    const mx = (q.x0 + q.x1) / 2, my = (q.y0 + q.y1) / 2;
    return q.kids[(n.y >= my ? 2 : 0) + (n.x >= mx ? 1 : 0)];
  }

  function qtSplit(q) {
    const mx = (q.x0 + q.x1) / 2, my = (q.y0 + q.y1) / 2;
    q.kids = [
      qtNew(q.x0, q.y0, mx, my), qtNew(mx, q.y0, q.x1, my),
      qtNew(q.x0, my, mx, q.y1), qtNew(mx, my, q.x1, q.y1),
    ];
  }

  function qtInsert(q, n, depth) {
    if (q.kids) { qtInsert(qtPick(q, n), n, depth + 1); return; }
    if (q.items === null) { q.items = [n]; return; }
    /* puncte suprapuse: sub adâncimea maximă rămân împreună în frunză */
    if (depth >= MAX_DEPTH) { q.items.push(n); return; }
    const old = q.items;
    q.items = null;
    qtSplit(q);
    for (const m of old) qtInsert(qtPick(q, m), m, depth + 1);
    qtInsert(qtPick(q, n), n, depth + 1);
  }

  function qtAccumulate(q) {
    if (q.kids) {
      let count = 0, sx = 0, sy = 0;
      for (const k of q.kids) {
        qtAccumulate(k);
        if (k.count) { count += k.count; sx += k.cx * k.count; sy += k.cy * k.count; }
      }
      q.count = count;
      if (count) { q.cx = sx / count; q.cy = sy / count; }
    } else if (q.items) {
      let sx = 0, sy = 0;
      for (const m of q.items) { sx += m.x; sy += m.y; }
      q.count = q.items.length;
      q.cx = sx / q.count; q.cy = sy / q.count;
    }
  }

  function qtBuild(nodes) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of nodes) {
      if (n.x < x0) x0 = n.x; if (n.x > x1) x1 = n.x;
      if (n.y < y0) y0 = n.y; if (n.y > y1) y1 = n.y;
    }
    /* pătrat, cu o margine, ca împărțirea în sferturi să fie uniformă */
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const half = Math.max(x1 - x0, y1 - y0) / 2 + 1;
    const root = qtNew(cx - half, cy - half, cx + half, cy + half);
    for (const n of nodes) qtInsert(root, n, 0);
    qtAccumulate(root);
    return root;
  }

  /* ======================= 6. Simulare de forțe ======================= */

  const SIM = {
    alpha: 0, alphaMin: 0.001, alphaTarget: 0,
    alphaDecay: 1 - Math.pow(0.001, 1 / 300),
    velocityDecay: 0.6,
    charge: -520, theta2: 0.81, distMin2: 4, distMax2: 1e7,
    linkDist: 46,
    /* Graful poate avea componente deconectate (aici: 4). Fără o gravitație
       spre origine, respingerea le-ar arunca la infinit și încadrarea ar
       strivi grupul principal într-un ghem. */
    gravity: 0.095,
  };

  function resetLayout() {
    /* filotaxie: puncte de start distribuite uniform, fără suprapuneri */
    const R0 = 12, A0 = Math.PI * (3 - Math.sqrt(5));
    S.nodes.forEach((n, i) => {
      const r = R0 * Math.sqrt(0.5 + i), a = i * A0;
      n.x = r * Math.cos(a); n.y = r * Math.sin(a);
      n.vx = n.vy = 0; n.fx = n.fy = null;
    });
    /* legăturile cu noduri de grad mare trag mai puțin de acestea */
    for (const l of S.links) {
      l.bias = l.source.deg / (l.source.deg + l.target.deg);
      l.strength = 1 / Math.min(l.source.deg, l.target.deg);
    }
    SIM.alpha = 1;
  }

  function applyManyBody(root, n, alpha) {
    if (!root.count) return;
    let dx = root.cx - n.x, dy = root.cy - n.y;
    let d2 = dx * dx + dy * dy;
    if (root.kids) {
      const w = root.x1 - root.x0;
      if (d2 === 0) { dx = jiggle(); dy = jiggle(); d2 = dx * dx + dy * dy; }
      if (w * w / SIM.theta2 < d2) {
        if (d2 < SIM.distMax2) {
          if (d2 < SIM.distMin2) d2 = Math.sqrt(SIM.distMin2 * d2);
          const f = root.count * SIM.charge * alpha / d2;
          n.vx += dx * f; n.vy += dy * f;
        }
        return;
      }
      for (const k of root.kids) applyManyBody(k, n, alpha);
      return;
    }
    if (!root.items) return;
    for (const m of root.items) {
      if (m === n) continue;
      let ex = m.x - n.x, ey = m.y - n.y;
      let e2 = ex * ex + ey * ey;
      if (e2 === 0) { ex = jiggle(); ey = jiggle(); e2 = ex * ex + ey * ey; }
      if (e2 >= SIM.distMax2) continue;
      if (e2 < SIM.distMin2) e2 = Math.sqrt(SIM.distMin2 * e2);
      const f = SIM.charge * alpha / e2;
      n.vx += ex * f; n.vy += ey * f;
    }
  }

  function applyCollide() {
    const nodes = S.nodes;
    if (!nodes.length) return;
    let maxR = 0;
    for (const n of nodes) if (n.r > maxR) maxR = n.r;
    const cell = Math.max(maxR * 2 + 4, 8);
    const grid = new Map();
    for (const n of nodes) {
      const key = Math.floor(n.x / cell) + ':' + Math.floor(n.y / cell);
      let bucket = grid.get(key);
      if (!bucket) grid.set(key, bucket = []);
      bucket.push(n);
    }
    for (const n of nodes) {
      const gi = Math.floor(n.x / cell), gj = Math.floor(n.y / cell);
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const bucket = grid.get((gi + di) + ':' + (gj + dj));
          if (!bucket) continue;
          for (const m of bucket) {
            if (m.index <= n.index) continue;      // fiecare pereche o singură dată
            let x = n.x + n.vx - m.x - m.vx;
            let y = n.y + n.vy - m.y - m.vy;
            let l = x * x + y * y;
            const rr = n.r + m.r + 2;
            if (l >= rr * rr) continue;
            if (l === 0) { x = jiggle(); y = jiggle(); l = x * x + y * y; }
            l = Math.sqrt(l);
            l = (rr - l) / l;
            const ni = n.r * n.r, mi = m.r * m.r;
            let share = mi / (ni + mi);
            n.vx += (x *= l) * share; n.vy += (y *= l) * share;
            share = 1 - share;
            m.vx -= x * share; m.vy -= y * share;
          }
        }
      }
    }
  }

  function tick() {
    SIM.alpha += (SIM.alphaTarget - SIM.alpha) * SIM.alphaDecay;
    const alpha = SIM.alpha;

    /* respingere */
    const root = qtBuild(S.nodes);
    for (const n of S.nodes) applyManyBody(root, n, alpha);

    /* arcuri pe muchii */
    for (const l of S.links) {
      const s = l.source, t = l.target;
      let x = t.x + t.vx - s.x - s.vx;
      let y = t.y + t.vy - s.y - s.vy;
      let d = Math.sqrt(x * x + y * y);
      if (d === 0) { x = jiggle(); y = jiggle(); d = Math.sqrt(x * x + y * y); }
      const f = (d - SIM.linkDist) / d * alpha * l.strength;
      x *= f; y *= f;
      t.vx -= x * l.bias; t.vy -= y * l.bias;
      s.vx += x * (1 - l.bias); s.vy += y * (1 - l.bias);
    }

    /* gravitație spre origine: ține componentele separate în cadru */
    for (const n of S.nodes) {
      n.vx -= n.x * SIM.gravity * alpha;
      n.vy -= n.y * SIM.gravity * alpha;
    }

    applyCollide();

    /* integrare + noduri fixate */
    for (const n of S.nodes) {
      if (n.fx != null) { n.x = n.fx; n.vx = 0; }
      else { n.x += (n.vx *= SIM.velocityDecay); }
      if (n.fy != null) { n.y = n.fy; n.vy = 0; }
      else { n.y += (n.vy *= SIM.velocityDecay); }
    }

    /* recentrare pe origine */
    let sx = 0, sy = 0;
    for (const n of S.nodes) { sx += n.x; sy += n.y; }
    sx /= S.nodes.length; sy /= S.nodes.length;
    for (const n of S.nodes) { n.x -= sx; n.y -= sy; }
  }

  /* rulează până se așază; folosit la încărcare și când mișcarea e dezactivată */
  function settle(steps = 320) {
    SIM.alpha = 1;
    for (let i = 0; i < steps && SIM.alpha > SIM.alphaMin; i++) tick();
    SIM.alpha = 0;
  }

  /* Cu mișcarea dezactivată nu reîncălzim: aranjamentul rămâne acolo unde s-a
     așezat, altfel fiecare atingere ar rearanja tot graful dintr-un salt. */
  function reheat(target = 0.4) {
    if (REDUCED) { requestDraw(); return; }
    SIM.alpha = Math.max(SIM.alpha, target);
    SIM.alphaTarget = 0;
    startLoop();
  }

  /* ======================= 7. Randare ======================= */

  const canvas = $('#graph');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let needsDraw = false, looping = false;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    DPR = clamp(window.devicePixelRatio || 1, 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    requestDraw();
  }

  const requestDraw = () => { needsDraw = true; startLoop(); };

  function startLoop() {
    if (looping) return;
    looping = true;
    requestAnimationFrame(frame);
  }

  function frame() {
    const running = SIM.alpha > SIM.alphaMin;
    if (running) { tick(); needsDraw = true; }
    if (needsDraw) { needsDraw = false; draw(); }
    if (running || needsDraw) requestAnimationFrame(frame);
    else looping = false;
  }

  const sx = (n) => n.x * S.view.k + S.view.x;
  const sy = (n) => n.y * S.view.k + S.view.y;

  /* ce rămâne aprins: nodul de sub cursor / cel ales / drumul găsit */
  function focusSets() {
    if (S.path) return { nodes: S.path.nodes, links: S.path.links, on: true };
    const f = S.hover || S.selected;
    if (!f) return { nodes: null, links: null, on: false };
    const nodes = new Set([f.id]);
    const links = new Set();
    for (const a of S.adj.get(f.id)) {
      if (!linkVisible(a.link)) continue;
      nodes.add(a.other.id);
      links.add(a.link);
    }
    return { nodes, links, on: true };
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!S.loaded) return;

    const k = S.view.k;
    const F = focusSets();
    const vis = S.nodes.filter(nodeVisible);

    /* --- muchii: întâi cele estompate, apoi cele aprinse deasupra --- */
    const strong = [];
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.rule;

    ctx.globalAlpha = F.on ? 0.10 : 0.34;
    ctx.lineWidth = Math.max(0.6, 1 * k);
    ctx.beginPath();
    let dashed = [];
    for (const l of S.links) {
      if (!linkVisible(l)) continue;
      if (F.on && F.links.has(l)) { strong.push(l); continue; }
      if (l.inferred) { dashed.push(l); continue; }
      ctx.moveTo(sx(l.source), sy(l.source));
      ctx.lineTo(sx(l.target), sy(l.target));
    }
    ctx.stroke();

    /* legăturile deduse: linie întreruptă, ca să nu treacă drept fapt */
    if (dashed.length) {
      ctx.save();
      ctx.setLineDash([4 * k, 4 * k]);
      ctx.beginPath();
      for (const l of dashed) {
        ctx.moveTo(sx(l.source), sy(l.source));
        ctx.lineTo(sx(l.target), sy(l.target));
      }
      ctx.stroke();
      ctx.restore();
    }

    for (const l of strong) drawStrongLink(l, k);

    /* --- noduri --- */
    ctx.globalAlpha = 1;
    ctx.lineWidth = Math.max(1, 1.4 * k);
    for (const n of vis) {
      const lit = !F.on || F.nodes.has(n.id);
      const r = Math.max(2, n.r * k);
      ctx.globalAlpha = lit ? 1 : 0.18;
      ctx.beginPath();
      ctx.arc(sx(n), sy(n), r, 0, Math.PI * 2);
      ctx.fillStyle = n.comRef ? n.comRef.color : C.other;
      ctx.fill();
      /* inelul de 2px pe culoarea pânzei separă nodurile suprapuse */
      ctx.strokeStyle = C.surface;
      ctx.stroke();
      if (n.kind !== 'code') {          // documente și concepte: miez gol
        ctx.beginPath();
        ctx.arc(sx(n), sy(n), Math.max(1, r * 0.42), 0, Math.PI * 2);
        ctx.fillStyle = C.surface;
        ctx.fill();
      }
    }

    /* conturul nodului ales */
    for (const n of [S.selected, S.pathA, S.pathB]) {
      if (!n || !nodeVisible(n)) continue;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(sx(n), sy(n), Math.max(2, n.r * k) + 4, 0, Math.PI * 2);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* Textul vine ultimul, altfel nodurile îl taie. Numele comunităților
       întâi, ca etichetele nodurilor să știe ce spațiu e deja luat. */
    ctx.globalAlpha = 1;
    const comBoxes = drawCommunityLabels(vis, F);
    drawNodeLabels(vis, F, k, comBoxes);
  }

  function drawStrongLink(l, k) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = S.path ? C.accent : C.ink2;
    ctx.lineWidth = Math.max(1.5, (S.path ? 2.6 : 1.9) * k);
    if (l.inferred) ctx.setLineDash([4 * k, 4 * k]);
    const x1 = sx(l.source), y1 = sy(l.source), x2 = sx(l.target), y2 = sy(l.target);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    /* vârf de săgeată: direcția contează pentru „contains” / „calls” */
    const dx = x2 - x1, dy = y2 - y1;
    const d = Math.hypot(dx, dy);
    if (d > 14) {
      const ux = dx / d, uy = dy / d;
      const back = Math.max(2, l.target.r * k) + 3;
      const tipX = x2 - ux * back, tipY = y2 - uy * back;
      const size = clamp(6 * k, 5, 11);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - ux * size + uy * size * 0.5, tipY - uy * size - ux * size * 0.5);
      ctx.lineTo(tipX - ux * size - uy * size * 0.5, tipY - uy * size + ux * size * 0.5);
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }
    ctx.restore();
  }

  const overlaps = (b, list) => list.some((t) => b.x0 < t.x1 && b.x1 > t.x0 && b.y0 < t.y1 && b.y1 > t.y0);

  /* Numele comunității, așezat DEASUPRA norului ei de noduri (nu peste el).
     Ăsta e canalul secundar de identitate: culoarea nu rămâne singurul indiciu.
     Întoarce dreptunghiurile ocupate, ca etichetele nodurilor să le ocolească. */
  function drawCommunityLabels(vis, F) {
    if (F.on || vis.length < 6) return [];
    const groups = new Map();
    for (const n of vis) {
      let g = groups.get(n.com);
      if (!g) groups.set(n.com, g = { x0: Infinity, x1: -Infinity, y0: Infinity, n: 0, ref: n.comRef });
      if (n.x < g.x0) g.x0 = n.x;
      if (n.x > g.x1) g.x1 = n.x;
      if (n.y - n.r < g.y0) g.y0 = n.y - n.r;
      g.n++;
    }
    /* comunitățile mari își aleg locul primele */
    const list = [...groups.values()].filter((g) => g.n >= 2 && g.ref).sort((a, b) => b.n - a.n);

    ctx.save();
    ctx.font = '600 10.5px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const boxes = [];
    for (const g of list) {
      const x = ((g.x0 + g.x1) / 2) * S.view.k + S.view.x;
      const y = g.y0 * S.view.k + S.view.y - 13;
      if (x < -80 || x > W + 80 || y < -20 || y > H + 20) continue;
      const text = g.ref.name.toUpperCase();
      const w = ctx.measureText(text).width;
      const box = { x0: x - w / 2 - 5, y0: y - 9, x1: x + w / 2 + 5, y1: y + 9 };
      if (overlaps(box, boxes)) continue;
      boxes.push(box);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = C.surface;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = C.muted;
      ctx.fillText(text, x, y);
    }
    ctx.restore();
    return boxes;
  }

  const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  /* Etichetele nodurilor: cele mai conectate au prioritate, iar cele care
     s-ar suprapune sunt sărite; mai bine mai puține, dar lizibile. */
  function drawNodeLabels(vis, F, k, reserved) {
    const candidates = F.on
      ? vis.filter((n) => F.nodes.has(n.id))
      : vis.filter((n) => n.deg >= 2 || k > 1.6);

    candidates.sort((a, b) => b.deg - a.deg);
    const limit = F.on ? 40 : 34;

    ctx.save();
    ctx.font = '500 11.5px ' + FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const taken = (reserved || []).slice();   // etichetele comunităților sunt deja pe hartă

    /* bulinele înseși sunt obstacole: o etichetă peste un nod se citește greu */
    const blockers = [];
    for (const n of vis) {
      const x = sx(n), y = sy(n), r = Math.max(2, n.r * k) + 1;
      if (x < -80 || x > W + 80 || y < -30 || y > H + 30) continue;
      blockers.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r });
    }

    let drawn = 0;
    for (const n of candidates) {
      if (drawn >= limit) break;
      const x = sx(n), y = sy(n);
      if (x < -60 || x > W + 60 || y < -20 || y > H + 20) continue;
      const w = ctx.measureText(n.label).width;
      const pad = Math.max(2, n.r * k) + 5;

      /* dreapta, stânga, dedesubt, deasupra; prima poziție liberă câștigă */
      const spots = [
        [x + pad, y],
        [x - pad - w, y],
        [x - w / 2, y + pad + 9],
        [x - w / 2, y - pad - 9],
      ];
      let at = null;
      for (const [tx, ty] of spots) {
        const box = { x0: tx - 2, y0: ty - 8, x1: tx + w + 2, y1: ty + 8 };
        if (!overlaps(box, taken) && !overlaps(box, blockers)) { at = { tx, ty, box }; break; }
      }
      if (!at) continue;

      taken.push(at.box);
      drawn++;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = C.surface;
      ctx.strokeText(n.label, at.tx, at.ty);
      ctx.fillStyle = n === S.hover || n === S.selected ? C.ink : C.ink2;
      ctx.fillText(n.label, at.tx, at.ty);
    }
    ctx.restore();
  }

  /* ---- încadrare ---- */
  function fitView(animate = true) {
    const vis = S.nodes.filter(nodeVisible);
    if (!vis.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of vis) {
      if (n.x - n.r < x0) x0 = n.x - n.r;
      if (n.x + n.r > x1) x1 = n.x + n.r;
      if (n.y - n.r < y0) y0 = n.y - n.r;
      if (n.y + n.r > y1) y1 = n.y + n.r;
    }
    const pad = 56;
    const k = clamp(Math.min((W - pad * 2) / Math.max(1, x1 - x0), (H - pad * 2) / Math.max(1, y1 - y0)), 0.05, 3);
    const target = {
      k,
      x: W / 2 - ((x0 + x1) / 2) * k,
      y: H / 2 - ((y0 + y1) / 2) * k,
    };
    if (animate && !REDUCED) animateView(target); else { S.view = target; requestDraw(); }
  }

  function centerOn(n, k = Math.max(S.view.k, 1.4)) {
    animateView({ k, x: W / 2 - n.x * k, y: H / 2 - n.y * k });
  }

  let viewAnim = null;
  function animateView(target) {
    if (REDUCED) { S.view = target; requestDraw(); return; }
    const from = { ...S.view };
    const t0 = performance.now(), dur = 380;
    if (viewAnim) cancelAnimationFrame(viewAnim);
    const step = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      S.view = {
        k: from.k + (target.k - from.k) * e,
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
      };
      requestDraw();
      if (p < 1) viewAnim = requestAnimationFrame(step); else viewAnim = null;
    };
    viewAnim = requestAnimationFrame(step);
  }

  /* ======================= 8. Interacțiune ======================= */

  const stage = $('#stage');
  const pointers = new Map();
  let panning = false, dragNode = null, movedPx = 0, pinchDist = 0;

  const toWorld = (px, py) => ({ x: (px - S.view.x) / S.view.k, y: (py - S.view.y) / S.view.k });

  function nodeAt(px, py) {
    const w = toWorld(px, py);
    const slack = 7 / S.view.k;
    let best = null, bestD = Infinity;
    for (const n of S.nodes) {
      if (!nodeVisible(n)) continue;
      const d = Math.hypot(n.x - w.x, n.y - w.y);
      if (d < n.r + slack && d < bestD) { best = n; bestD = d; }
    }
    return best;
  }

  const localXY = (ev) => {
    const r = canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  };

  canvas.addEventListener('pointerdown', (ev) => {
    canvas.setPointerCapture(ev.pointerId);
    const p = localXY(ev);
    pointers.set(ev.pointerId, p);
    movedPx = 0;

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      panning = false; dragNode = null;
      return;
    }
    const hit = nodeAt(p.x, p.y);
    if (hit) {
      dragNode = hit;
      hit.fx = hit.x; hit.fy = hit.y;
      SIM.alphaTarget = 0.12;
      reheat(0.3);
    } else {
      panning = true;
      canvas.classList.add('grabbing');
    }
  });

  canvas.addEventListener('pointermove', (ev) => {
    const p = localXY(ev);
    const prev = pointers.get(ev.pointerId);
    if (prev) {
      movedPx += Math.hypot(p.x - prev.x, p.y - prev.y);
      pointers.set(ev.pointerId, p);
    }

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinchDist);
      pinchDist = d;
      return;
    }

    if (dragNode) {
      const w = toWorld(p.x, p.y);
      dragNode.fx = w.x; dragNode.fy = w.y;
      requestDraw();
      return;
    }
    if (panning && prev) {
      S.view.x += p.x - prev.x;
      S.view.y += p.y - prev.y;
      requestDraw();
      return;
    }
    setHover(nodeAt(p.x, p.y), ev.clientX, ev.clientY);
  });

  function endPointer(ev) {
    const p = pointers.get(ev.pointerId);
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) pinchDist = 0;

    if (dragNode) {
      SIM.alphaTarget = 0;
      /* un simplu clic nu fixează nodul; o tragere adevărată, da */
      if (movedPx < 4) { dragNode.fx = dragNode.fy = null; select(dragNode); }
      else reheat(0.1);
      dragNode = null;
      return;
    }
    if (panning) {
      panning = false;
      canvas.classList.remove('grabbing');
      if (movedPx < 4 && p) select(null);
    }
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', () => { setHover(null); });

  function zoomAt(px, py, factor) {
    const k = clamp(S.view.k * factor, 0.06, 8);
    const f = k / S.view.k;
    S.view.x = px - (px - S.view.x) * f;
    S.view.y = py - (py - S.view.y) * f;
    S.view.k = k;
    requestDraw();
  }

  canvas.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const p = localXY(ev);
    const unit = ev.deltaMode === 1 ? 20 : ev.deltaMode === 2 ? 100 : 1;
    zoomAt(p.x, p.y, Math.pow(0.999, ev.deltaY * unit));
  }, { passive: false });

  const tipEl = $('#tip');

  function setHover(n, clientX, clientY) {
    if (n !== S.hover) {
      S.hover = n;
      canvas.classList.toggle('pointing', !!n);
      requestDraw();
    }
    if (!n) { tipEl.hidden = true; return; }
    const where = n.file ? `${n.file}${n.loc ? ':' + n.loc : ''}` : '';
    tipEl.textContent = `${n.label} · ${n.deg} legături${where ? ' · ' + where : ''}`;
    tipEl.hidden = false;
    if (clientX != null) {
      const r = stage.getBoundingClientRect();
      const x = clamp(clientX - r.left, 90, r.width - 90);
      const y = clamp(clientY - r.top - 16, 30, r.height - 20);
      tipEl.style.left = x + 'px';
      tipEl.style.top = y + 'px';
      tipEl.style.transform = 'translate(-50%, -100%)';
    }
  }

  /* ======================= 9. Panouri ======================= */

  function buildPanels() {
    $('#stats').innerHTML =
      `<strong>${S.nodes.length}</strong> noduri · <strong>${S.links.length}</strong> muchii · ` +
      `<strong>${S.communities.length}</strong> comunități`;
    $('#commit').textContent = S.commit ? `construit din commit ${S.commit}` : '';

    paintLegend();
    paintChecklist($('#relations'), S.relations, S.filters.rel, (name) => name);
    paintChecklist($('#kinds'), S.kinds, S.filters.kind, (name) => KIND_RO[name] || name);
    paintHubs();
    renderDetails(null);
    paintPathbar();
  }

  /* Lista de comunități e și legendă, și varianta „tabel” cerută de regula
     de relief pentru culorile cu contrast mic pe fundal deschis. */
  function paintLegend() {
    const ul = $('#communities');
    if (!ul) return;
    ul.textContent = '';
    for (const c of S.communities) {
      const li = el('li');
      const row = el('label', 'check-row');
      const cb = el('input');
      cb.type = 'checkbox';
      cb.checked = S.filters.com.has(c.id);
      cb.addEventListener('change', () => {
        if (cb.checked) S.filters.com.add(c.id); else S.filters.com.delete(c.id);
        afterFilterChange();
      });
      const sw = el('span', 'swatch');
      sw.style.setProperty('--c', c.color);
      const label = el('span', 'check-label', c.slot < 0 ? `${c.name} (Altele)` : c.name);
      label.title = c.name;
      row.append(cb, sw, label, el('span', 'count', String(c.count)));
      li.append(row);
      ul.append(li);
    }
  }

  function paintChecklist(ul, items, set, labelFn) {
    ul.textContent = '';
    for (const it of items) {
      const li = el('li');
      const row = el('label', 'check-row');
      const cb = el('input');
      cb.type = 'checkbox';
      cb.checked = set.has(it.name);
      cb.addEventListener('change', () => {
        if (cb.checked) set.add(it.name); else set.delete(it.name);
        afterFilterChange();
      });
      row.append(cb, el('span', 'check-label', labelFn(it.name)), el('span', 'count', String(it.count)));
      li.append(row);
      ul.append(li);
    }
  }

  function paintHubs() {
    const ol = $('#hubs');
    ol.textContent = '';
    const top = [...S.nodes].sort((a, b) => b.deg - a.deg).slice(0, 10);
    for (const n of top) {
      const li = el('li');
      const b = el('button');
      b.type = 'button';
      const lbl = el('span', 'h-label', n.label);
      lbl.title = n.label;
      b.append(lbl, el('span', 'h-deg', String(n.deg)));
      b.addEventListener('click', () => { select(n); centerOn(n); });
      li.append(b);
      ol.append(li);
    }
  }

  function afterFilterChange() {
    if (S.selected && !nodeVisible(S.selected)) select(null);
    if (S.path) clearPath();
    requestDraw();
  }

  /* ---- detalii ---- */
  const detailsEl = $('#details');
  const detailsBody = $('#details-body');

  function select(n) {
    S.selected = n;
    renderDetails(n);
    requestDraw();
  }

  function renderDetails(n) {
    detailsBody.textContent = '';
    if (!n) { detailsEl.hidden = true; return; }
    detailsEl.hidden = false;

    const head = el('div', 'd-head');
    head.append(el('h2', 'd-title', n.label));
    const badges = el('div', 'd-badges');
    badges.append(el('span', 'badge', KIND_RO[n.kind] || n.kind));
    if (n.comRef) {
      const b = el('span', 'badge');
      const dot = el('span', 'dot');
      dot.style.setProperty('--c', n.comRef.color);
      b.append(dot, document.createTextNode(n.comRef.name));
      badges.append(b);
    }
    head.append(badges);

    const facts = el('dl', 'd-facts');
    const fact = (k, v, mono) => {
      if (!v) return;
      const row = el('div');
      row.append(el('dt', null, k), el('dd', mono ? 'mono' : null, v));
      facts.append(row);
    };
    fact('Fișier', n.file + (n.loc ? ':' + n.loc : ''), true);
    fact('Legături', String(n.deg));
    fact('Origine', n.origin);
    fact('Identificator', n.id, true);

    const acts = el('div', 'd-acts');
    const pinBtn = el('button', 'mini-btn', n.fx != null ? '📌 eliberează' : '📌 fixează');
    pinBtn.type = 'button';
    pinBtn.addEventListener('click', () => {
      if (n.fx != null) { n.fx = n.fy = null; reheat(0.2); } else { n.fx = n.x; n.fy = n.y; }
      renderDetails(n);
    });
    const aBtn = el('button', 'mini-btn', 'pune ca A');
    aBtn.type = 'button';
    aBtn.addEventListener('click', () => { S.pathA = n; computePath(); });
    const bBtn = el('button', 'mini-btn', 'pune ca B');
    bBtn.type = 'button';
    bBtn.addEventListener('click', () => { S.pathB = n; computePath(); });
    const cBtn = el('button', 'mini-btn', 'centrează');
    cBtn.type = 'button';
    cBtn.addEventListener('click', () => centerOn(n));
    acts.append(pinBtn, aBtn, bBtn, cBtn);

    detailsBody.append(head, facts, acts);

    /* vecinii, grupați pe tipul relației */
    const near = S.adj.get(n.id).filter((a) => linkVisible(a.link));
    const groups = new Map();
    for (const a of near) {
      let g = groups.get(a.link.rel);
      if (!g) groups.set(a.link.rel, g = []);
      g.push(a);
    }
    const sorted = [...groups.entries()].sort((x, y) => y[1].length - x[1].length);

    if (!near.length) {
      detailsBody.append(el('p', 'empty-note', 'Nicio legătură vizibilă cu filtrele curente.'));
    }

    for (const [rel, list] of sorted) {
      const sec = el('div', 'd-group');
      sec.append(el('h3', null, `${rel} · ${list.length}`));
      const ul = el('ul', 'neighbors');
      list.sort((a, b) => b.other.deg - a.other.deg);
      for (const a of list) {
        const li = el('li');
        const b = el('button');
        b.type = 'button';
        b.append(el('span', 'dir', a.out ? '→' : '←'));
        const dot = el('span', 'swatch');
        dot.style.setProperty('--c', a.other.comRef ? a.other.comRef.color : C.other);
        const lbl = el('span', 'n-label', a.other.label);
        lbl.title = a.other.label;
        b.append(dot, lbl);
        if (a.link.inferred) {
          const tag = el('span', 'n-rel inferred', 'dedus');
          tag.title = 'Legătură dedusă, nu extrasă direct din cod' +
            (a.link.conf != null ? ` (încredere ${a.link.conf})` : '');
          b.append(tag);
        } else if (a.link.context) {
          b.append(el('span', 'n-rel', a.link.context));
        }
        b.addEventListener('click', () => { select(a.other); centerOn(a.other); });
        li.append(b);
        ul.append(li);
      }
      sec.append(ul);
      detailsBody.append(sec);
    }
  }

  $('#details-close').addEventListener('click', () => select(null));

  /* ======================= 10. Căutare ======================= */

  const searchEl = $('#search');
  const resultsEl = $('#search-results');
  let results = [], activeIdx = -1;

  function runSearch() {
    const q = fold(searchEl.value.trim());
    resultsEl.textContent = '';
    activeIdx = -1;
    if (!q) { hideResults(); return; }

    results = S.nodes
      .filter((n) => nodeVisible(n) && n.search.includes(q))
      .sort((a, b) => {
        const ai = fold(a.label).indexOf(q), bi = fold(b.label).indexOf(q);
        const aStarts = ai === 0 ? 0 : 1, bStarts = bi === 0 ? 0 : 1;
        return aStarts - bStarts || b.deg - a.deg || a.label.length - b.label.length;
      })
      .slice(0, 12);

    if (!results.length) {
      resultsEl.append(el('li', 'empty', 'Niciun nod potrivit.'));
    } else {
      results.forEach((n, i) => {
        const li = el('li');
        li.setAttribute('role', 'option');
        const b = el('button');
        b.type = 'button';
        const dot = el('span', 'swatch');
        dot.style.setProperty('--c', n.comRef ? n.comRef.color : C.other);
        b.append(dot, el('span', 'r-label', n.label));
        if (n.file) b.append(el('span', 'r-file', n.file));
        b.addEventListener('click', () => pick(i));
        li.append(b);
        resultsEl.append(li);
      });
    }
    resultsEl.hidden = false;
    searchEl.setAttribute('aria-expanded', 'true');
  }

  function hideResults() {
    resultsEl.hidden = true;
    searchEl.setAttribute('aria-expanded', 'false');
    results = [];
    activeIdx = -1;
  }

  function pick(i) {
    const n = results[i];
    if (!n) return;
    select(n);
    centerOn(n, Math.max(S.view.k, 1.8));
    hideResults();
    searchEl.blur();
  }

  function moveActive(delta) {
    if (!results.length) return;
    activeIdx = (activeIdx + delta + results.length) % results.length;
    [...resultsEl.children].forEach((li, i) => li.classList.toggle('active', i === activeIdx));
  }

  searchEl.addEventListener('input', runSearch);
  searchEl.addEventListener('focus', () => { if (searchEl.value) runSearch(); });
  searchEl.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); moveActive(1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); moveActive(-1); }
    else if (ev.key === 'Enter') { ev.preventDefault(); pick(activeIdx >= 0 ? activeIdx : 0); }
    else if (ev.key === 'Escape') { searchEl.value = ''; hideResults(); searchEl.blur(); }
  });
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.search-wrap')) hideResults();
  });

  /* ======================= 11. Drum minim ======================= */

  function computePath() {
    paintPathbar();
    const a = S.pathA, b = S.pathB;
    if (!a || !b || a === b) { S.path = null; showPathResult(a && b ? 'același nod' : ''); requestDraw(); return; }

    /* lățime întâi, pe graful nefiltrat de direcție: muchiile ascunse nu se folosesc */
    const prev = new Map([[a.id, null]]);
    const queue = [a];
    let found = false;
    for (let i = 0; i < queue.length && !found; i++) {
      const cur = queue[i];
      for (const edge of S.adj.get(cur.id)) {
        if (!linkVisible(edge.link) || prev.has(edge.other.id)) continue;
        prev.set(edge.other.id, { from: cur, link: edge.link });
        if (edge.other === b) { found = true; break; }
        queue.push(edge.other);
      }
    }

    if (!found) {
      S.path = null;
      showPathResult('fără drum', true);
      requestDraw();
      return;
    }

    const nodes = new Set(), links = new Set();
    let cur = b;
    nodes.add(b.id);
    while (true) {
      const step = prev.get(cur.id);
      if (!step) break;
      links.add(step.link);
      nodes.add(step.from.id);
      cur = step.from;
    }
    S.path = { nodes, links, len: links.size };
    showPathResult(`${links.size} ${links.size === 1 ? 'pas' : 'pași'}`);
    fitToPath();
    requestDraw();
  }

  function fitToPath() {
    const pts = [...S.path.nodes].map((id) => S.byId.get(id)).filter(Boolean);
    if (pts.length < 2) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of pts) {
      x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x);
      y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y);
    }
    const pad = 110;
    const k = clamp(Math.min((W - pad * 2) / Math.max(1, x1 - x0), (H - pad * 2) / Math.max(1, y1 - y0)), 0.1, 2.4);
    animateView({ k, x: W / 2 - ((x0 + x1) / 2) * k, y: H / 2 - ((y0 + y1) / 2) * k });
  }

  function showPathResult(text, none) {
    const r = $('#path-result');
    r.textContent = text || '';
    r.classList.toggle('none', !!none);
  }

  function paintPathbar() {
    const a = $('#slot-a'), b = $('#slot-b');
    a.textContent = 'A: ' + (S.pathA ? S.pathA.label : '?');
    b.textContent = 'B: ' + (S.pathB ? S.pathB.label : '?');
    a.classList.toggle('set', !!S.pathA);
    b.classList.toggle('set', !!S.pathB);
  }

  function clearPath() {
    S.pathA = S.pathB = S.path = null;
    paintPathbar();
    showPathResult('');
    requestDraw();
  }

  $('#slot-a').addEventListener('click', () => {
    if (S.selected) { S.pathA = S.selected; computePath(); }
    else showPathResult('alege întâi un nod', true);
  });
  $('#slot-b').addEventListener('click', () => {
    if (S.selected) { S.pathB = S.selected; computePath(); }
    else showPathResult('alege întâi un nod', true);
  });
  $('#path-clear').addEventListener('click', clearPath);

  /* ======================= 12. Pornire ======================= */

  /* butoane */
  $('#btn-fit').addEventListener('click', () => fitView());
  $('#btn-relayout').addEventListener('click', () => {
    if (!S.loaded) return;
    resetLayout();
    if (REDUCED) { settle(); fitView(); requestDraw(); } else { startLoop(); setTimeout(() => fitView(), 900); }
  });
  $('#btn-theme').addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  $('#btn-side').addEventListener('click', () => $('#side').classList.toggle('open'));

  $('#btn-png').addEventListener('click', () => {
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    const octx = out.getContext('2d');
    octx.fillStyle = C.surface;
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(canvas, 0, 0);
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graf.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  });

  for (const id of ['#file-input', '#file-input-2']) {
    $(id).addEventListener('change', (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (f) loadFromFile(f);
      ev.target.value = '';
    });
  }

  /* inversarea unui grup întreg de filtre */
  for (const btn of document.querySelectorAll('[data-toggle-all]')) {
    btn.addEventListener('click', () => {
      const which = btn.dataset.toggleAll;
      if (which === 'com') {
        const all = S.communities.map((c) => c.id);
        S.filters.com = new Set(all.filter((id) => !S.filters.com.has(id)));
        paintLegend();
      } else {
        const all = S.relations.map((r) => r.name);
        S.filters.rel = new Set(all.filter((n) => !S.filters.rel.has(n)));
        paintChecklist($('#relations'), S.relations, S.filters.rel, (n) => n);
      }
      afterFilterChange();
    });
  }

  $('#only-inferred').addEventListener('change', (ev) => {
    S.filters.inferredOnly = ev.target.checked;
    afterFilterChange();
  });

  /* trage și lasă un graph.json oriunde peste scenă */
  const dz = $('#dropzone');
  for (const type of ['dragenter', 'dragover']) {
    stage.addEventListener(type, (ev) => { ev.preventDefault(); dz.hidden = false; dz.classList.add('over'); });
  }
  stage.addEventListener('dragleave', (ev) => {
    if (ev.relatedTarget && stage.contains(ev.relatedTarget)) return;
    dz.classList.remove('over');
    if (S.loaded) dz.hidden = true;
  });
  stage.addEventListener('drop', (ev) => {
    ev.preventDefault();
    dz.classList.remove('over');
    const f = ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (f) loadFromFile(f); else if (S.loaded) dz.hidden = true;
  });

  /* taste */
  document.addEventListener('keydown', (ev) => {
    if (ev.target.matches('input, textarea')) return;
    if (ev.key === '/') { ev.preventDefault(); searchEl.focus(); searchEl.select(); }
    else if (ev.key === 'Escape') { select(null); clearPath(); hideResults(); }
    else if (ev.key === 'f' || ev.key === 'F') fitView();
    else if (ev.key === 'r' || ev.key === 'R') $('#btn-relayout').click();
    else if (ev.key === 't' || ev.key === 'T') $('#btn-theme').click();
  });

  new ResizeObserver(resize).observe(stage);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
    if (!saved) initTheme();
  });

  /* Instalabilă pe telefon și funcțională fără net. Cere context securizat,
     deci sare peste `file://` și peste http-ul simplu de pe alt calculator. */
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  initTheme();
  resize();

  const url = new URLSearchParams(location.search).get('graph') || DEFAULT_GRAPH;
  loadFromUrl(url).catch((err) => {
    const local = location.protocol === 'file:';
    showDropzone(
      'Lasă un graph.json aici',
      local
        ? 'Pagina e deschisă direct de pe disc, așa că browserul nu poate citi fișierul singur. Trage-l aici sau pornește un server local.'
        : `Nu am găsit ${url} (${err.message}). Trage un graph.json aici.`
    );
  });
})();
