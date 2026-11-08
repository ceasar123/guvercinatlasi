/* Güvercin Atlası: kaydırmaya bağlı sahne. Kütüphanesiz. Durağan mod: CSS (.kh yoksa ya da azaltılmış hareket). */
(() => {
  const d = document, h = d.documentElement, M = s => matchMedia(s);
  if (!h.classList.contains('kh') || M('(prefers-reduced-motion: reduce)').matches) return;
  const P = (e, n) => parseFloat(getComputedStyle(e).getPropertyValue(n));
  const sinir = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const bos = f => (window.requestIdleCallback || setTimeout)(f);
  const yuklendi = f => d.readyState == 'complete' ? bos(f) : addEventListener('load', () => bos(f));

  // A2: manifest.plan = [v0 adı, v1 adı, kare0, kare1, ölçek0, ölçek1]; kare -1 = siyah kesme. Eşikler CSS'te (--a0 ...).
  function ana(iz, s) {
    const c = s.querySelector('canvas'), x = c.getContext('2d'), yon = M('(orientation: landscape)'), V = n => P(iz, '--' + n);
    let m, o, blob = [], bm = new Map(), bek = new Set(), son = '', v = 0, ver = 0;
    function yukle() {
      const st = yon.matches ? 'yatay' : 'dikey', my = ++ver;
      for (const b of bm.values()) b.close();
      o = m[st]; blob = []; bm = new Map(); bek = new Set(); son = '';
      const N = o.kare.length, sira = [...o.oncelik], var_ = new Set(sira);
      for (const a of [8, 4, 2, 1]) for (let i = 0; i < N; i += a) if (!var_.has(i)) { var_.add(i); sira.push(i); }
      let j = 0, n = 0;
      const sonraki = () => {
        if (my != ver || j >= sira.length) return;
        const i = sira[j++];
        fetch(o.yol + o.kare[i]).then(r => r.blob()).then(b => {
          if (my != ver) return;
          blob[i] = b; h.dataset.a2 = ++n + '/' + N; ciz(); sonraki();
        }).catch(sonraki);
      };
      for (let q = 0; q < 4; q++) sonraki();
    }
    function bit(i) {
      const b = bm.get(i);
      if (b) { bm.delete(i); bm.set(i, b); return b; }
      if (bek.has(i)) return;
      const my = ver; bek.add(i); h.dataset.a2b = bek.size;
      createImageBitmap(blob[i]).then(b => {
        bek.delete(i); h.dataset.a2b = bek.size;
        if (my != ver) return b.close();
        bm.set(i, b);
        if (bm.size > 14) { const [k0, b0] = bm.entries().next().value; bm.delete(k0); b0.close(); }
        ciz();
      });
    }
    yuklendi(() => fetch('/assets/a2/manifest.json').then(r => r.json()).then(j => { m = j; yukle(); }));
    yon.addEventListener('change', () => m && yukle());
    function ciz() {
      if (!o) return;
      const L = (p, j, t, z) => p[j] == null ? z : p[j] + (p[j + 1] - p[j]) * t;
      let i = 0, k = 1, y = 0, f = -1, b;
      for (const p of o.plan) {
        const a = V(p[0]), t = sinir((v - a) / (V(p[1]) - a || 1));
        if (v < a && p != o.plan[0]) break;
        i = p[2] < 0 ? -1 : Math.round(L(p, 2, t)); k = L(p, 4, t, 1); y = L(p, 6, t, 0);
      }
      if (i >= 0) {
        for (let r = 0; r < o.kare.length && f < 0; r++) f = blob[i - r] ? i - r : blob[i + r] ? i + r : -1;
        if (f < 0 || !(b = bit(f))) return;
      }
      const dpr = Math.min(devicePixelRatio || 1, 3), W = Math.round(s.clientWidth * dpr), H = Math.round(s.clientHeight * dpr);
      const key = f + ':' + k.toFixed(4) + ':' + y.toFixed(4) + ':' + W + 'x' + H;
      if (key == son) return;
      if (c.width != W || c.height != H) { c.width = W; c.height = H; }
      x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
      if (b) {
        const sc = (o.kip == 'en' ? W / b.width : Math.max(W / b.width, H / b.height)) * k, dw = b.width * sc, dh = b.height * sc;
        let oy = .5;
        for (const r of o.oy) if (f >= r[0] && f <= r[1]) oy = r[2];
        x.imageSmoothingQuality = 'high';
        x.drawImage(b, (W - dw) / 2, (H - dh) * oy + y * H, dw, dh);
      }
      son = key; c.hidden = false;
    }
    return u => {
      v = u;
      const ks = V('kes');
      s.classList.toggle('levha-acik', v >= V('lv') && v < V('b0'));
      s.classList.toggle('kesik', v >= ks);
      s.style.setProperty('--ilr', sinir((v - V('a0')) / (ks - V('a0'))));
      ciz();
    };
  }

  function irk(iz, s) {
    const z = s.querySelector('.zoom'), css = CSS.supports('animation-timeline', 'view()');
    return v => {
      const r = v / (P(iz, '--iz') - 100);
      if (!css) z.style.transform = 'scale(' + (9 - 8 * sinir((r - .14) / .5)) + ')';
      s.classList.toggle('levha-acik', r >= .64 && r < .8);
      s.classList.toggle('kesik', r >= .8);
    };
  }

  for (const iz of d.querySelectorAll('.iz')) {
    const s = iz.querySelector('.sahne-k'), k = iz.dataset.iz == 'ana' ? ana(iz, s) : irk(iz, s);
    let gor = 0, bekle = 0;
    const tik = () => { bekle = 0; k(-iz.getBoundingClientRect().top / (iz.offsetHeight / P(iz, '--iz'))); };
    const iste = () => { if (gor && !bekle) { bekle = 1; requestAnimationFrame(tik); } };
    new IntersectionObserver(e => { gor = e[0].isIntersecting; iste(); }).observe(iz);
    addEventListener('scroll', iste, { passive: true });
    addEventListener('resize', iste);
    gor = 1; tik(); gor = 0;
  }
})();
