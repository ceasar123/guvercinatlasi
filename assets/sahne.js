/* Güvercin Atlası: kaydırmaya bağlı sahne. Kütüphanesiz. Durağan mod: CSS (.kh yoksa ya da azaltılmış hareket). */
(() => {
  const d = document, h = d.documentElement, M = s => matchMedia(s);
  if (!h.classList.contains('kh') || M('(prefers-reduced-motion: reduce)').matches) return;
  const P = (e, n) => parseFloat(getComputedStyle(e).getPropertyValue(n));
  const sinir = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const bos = f => (window.requestIdleCallback || setTimeout)(f);
  const yuklendi = f => d.readyState == 'complete' ? bos(f) : addEventListener('load', () => bos(f));

  function ana(iz, s) {
    const c = s.querySelector('canvas'), x = c.getContext('2d'), yon = M('(orientation: landscape)');
    let m, set, kare = [], N = 0, na = 0, son = -1, en = 0;
    const p3 = i => String(i).padStart(3, '0');
    function yukle() {
      const st = yon.matches ? 'yatay' : 'dikey', o = m[st], ad = [];
      set = st; kare = []; son = -1; na = o.a;
      for (let i = 0; i < o.a; i++) ad.push('a' + p3(i));
      for (let i = 0; i < o.b; i++) ad.push('b' + p3(i));
      N = ad.length;
      // aşamalı: ilk ve tutma karesi, sonra her 8., 4., 2. ve hepsi
      const sira = [0, N - 1], var_ = new Set(sira);
      for (const a of [8, 4, 2, 1]) for (let i = 0; i < N; i += a) if (!var_.has(i)) { var_.add(i); sira.push(i); }
      let j = 0;
      const sonraki = () => {
        if (set != st || j >= sira.length) return;
        const i = sira[j++];
        fetch(o.yol + ad[i] + '.webp').then(r => r.blob()).then(createImageBitmap).then(b => {
          if (set != st) return;
          kare[i] = b; son = -1; ciz(); sonraki();
        }).catch(sonraki);
      };
      for (let q = 0; q < 4; q++) sonraki();
    }
    yuklendi(() => fetch('/assets/k1/manifest.json').then(r => r.json()).then(j => { m = j; yukle(); }));
    yon.addEventListener('change', () => m && yukle());
    let v = 0;
    function ciz() {
      if (!N) return;
      const a0 = P(iz, '--a0'), a1 = P(iz, '--a1'), b1 = P(iz, '--b1'), nb = N - na;
      let i = v < a0 ? 0 : v < a1 ? Math.round((v - a0) / (a1 - a0) * (na - 1)) : na + Math.min(nb - 1, Math.round((v - a1) / (b1 - a1) * (nb - 1)));
      let k = -1;
      for (let r = 0; r < N && k < 0; r++) k = kare[i - r] ? i - r : kare[i + r] ? i + r : -1;
      const w = c.clientWidth, hh = c.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      const yeni = Math.round(w * dpr) + 'x' + Math.round(hh * dpr);
      if (k < 0 || (k == son && yeni == en)) return;
      if (yeni != en) { en = yeni; c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr); }
      const b = kare[k], o = Math.max(c.width / b.width, c.height / b.height);
      x.drawImage(b, (c.width - b.width * o) / 2, (c.height - b.height * o) / 2, b.width * o, b.height * o);
      son = k; c.hidden = false;
    }
    return u => {
      v = u;
      const a0 = P(iz, '--a0'), b1 = P(iz, '--b1'), lv = P(iz, '--lv'), ks = P(iz, '--kes');
      s.classList.toggle('levha-acik', v >= lv && v < ks);
      s.classList.toggle('kesik', v >= ks);
      s.style.setProperty('--ilr', sinir((v - a0) / (b1 - a0)));
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
