/* Güvercin Atlası ırk haritası: açılan kart + grup süzme. JS yoksa harita ve il listesi aynen çalışır. */
(function () {
  "use strict";
  var bolum = document.querySelector(".harita");
  var veriEl = document.getElementById("harita-veri");
  if (!bolum || !veriEl || !window.JSON) return;
  var VERI;
  try { VERI = JSON.parse(veriEl.textContent); } catch (e) { return; }
  var cerceve = bolum.querySelector(".harita-cerceve");
  var kart = bolum.querySelector(".harita-kart");
  var arac = bolum.querySelector(".harita-arac");
  var svg = bolum.querySelector(".harita-svg");
  var acikIl = null, acan = null, grup = "";

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function kartiKapat(odakGeri) {
    if (!acikIl) return;
    kart.hidden = true;
    kart.textContent = "";
    var a = svg.querySelector('a[data-il="' + acikIl + '"]');
    if (a) { a.classList.remove("secili"); a.setAttribute("aria-expanded", "false"); }
    acikIl = null;
    if (odakGeri && acan) acan.focus();
    acan = null;
  }

  function kartiAc(il, a) {
    var v = VERI[il];
    if (!v) return;
    if (acikIl === il) { kartiKapat(true); return; }
    kartiKapat(false);
    acikIl = il; acan = a;
    a.classList.add("secili");
    a.setAttribute("aria-expanded", "true");
    kart.textContent = "";
    kart.setAttribute("role", "dialog");
    kart.setAttribute("aria-label", v.ad + " ırkları");
    var ust = el("div", "hk-ust");
    ust.appendChild(el("h3", null, v.ad));
    var kapa = el("button", "hk-kapat");
    kapa.type = "button";
    kapa.setAttribute("aria-label", "Kartı kapat");
    kapa.textContent = "×";
    kapa.addEventListener("click", function () { kartiKapat(true); });
    ust.appendChild(kapa);
    kart.appendChild(ust);
    if (v.ikincil) kart.appendChild(el("p", "hk-not", "Bu ili yalnız bir derleme anıyor."));
    var liste = el("ul", "hk-liste" + (v.irk.length > 1 ? " coklu" : ""));
    v.irk.forEach(function (r) {
      var li = el("li");
      var link = el("a");
      link.href = r.url;
      var img = el("img");
      img.src = r.img; img.alt = ""; img.width = 120; img.height = 120; img.loading = "lazy";
      link.appendChild(img);
      var yazi = el("span", "hk-yazi");
      yazi.appendChild(el("span", "hk-grup", r.grup));
      yazi.appendChild(el("strong", null, r.ad));
      if (v.irk.length === 1) yazi.appendChild(el("span", "hk-cumle", r.cumle));
      if (r.not_) yazi.appendChild(el("span", "hk-ek", r.not_));
      yazi.appendChild(el("span", "hk-git", "Sayfayı oku"));
      link.appendChild(yazi);
      li.appendChild(link);
      liste.appendChild(li);
    });
    kart.appendChild(liste);
    kart.hidden = false;
    yerlestir(a);
    kapa.focus({ preventScroll: true });
  }

  function yerlestir(a) {
    var dar = window.matchMedia("(max-width: 767px)").matches;
    kart.classList.toggle("alt", dar);
    if (dar) { kart.style.left = ""; kart.style.top = ""; return; }
    var W = cerceve.clientWidth, H = cerceve.clientHeight;
    var kw = kart.offsetWidth, kh = kart.offsetHeight, P = 26, M = 12;
    function pos(n) { return [parseFloat(n.getAttribute("data-x")) / 100 * W, parseFloat(n.getAttribute("data-y")) / 100 * H]; }
    var o = pos(a), px = o[0], py = o[1];
    var digerleri = Array.prototype.filter.call(svg.querySelectorAll("a[data-il]"), function (n) { return n !== a; }).map(pos);
    function sinirla(l, t) { return [Math.min(Math.max(M, l), W - kw - M), Math.min(Math.max(M, t), H - kh - M)]; }
    var adaylar = [sinirla(px + P, py - kh / 2), sinirla(px - P - kw, py - kh / 2), sinirla(px - kw / 2, py - P - kh), sinirla(px - kw / 2, py + P)];
    var en = null, enPuan = 1e9;
    adaylar.forEach(function (c, i) {
      var l = c[0], t = c[1], puan = i * 0.1;
      if (px > l - 6 && px < l + kw + 6 && py > t - 6 && py < t + kh + 6) puan += 100;  // kendi noktasını örtmesin
      digerleri.forEach(function (d) { if (d[0] > l - 30 && d[0] < l + kw + 30 && d[1] > t - 20 && d[1] < t + kh + 20) puan += 10; });
      if (puan < enPuan) { enPuan = puan; en = c; }
    });
    kart.style.left = en[0] + "px";
    kart.style.top = en[1] + "px";
  }

  // noktalar: tıklama kartı açar (bağlantı yerine)
  Array.prototype.forEach.call(svg.querySelectorAll("a[data-il]"), function (a) {
    a.setAttribute("role", "button");
    a.setAttribute("aria-expanded", "false");
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (a.classList.contains("sonuk")) return;
      kartiAc(a.getAttribute("data-il"), a);
    });
    a.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); a.click(); }
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") kartiKapat(true); });
  document.addEventListener("click", function (e) {
    if (acikIl && !kart.contains(e.target) && !e.target.closest(".harita-svg a")) kartiKapat(false);
  });
  window.addEventListener("resize", function () {
    if (acikIl && acan) yerlestir(acan);
  });

  // grup süzme
  var gruplar = [];
  Object.keys(VERI).forEach(function (il) {
    VERI[il].irk.forEach(function (r) { if (gruplar.indexOf(r.grup) < 0) gruplar.push(r.grup); });
  });
  var SIRA = ["Taklacılar", "Dalıcılar", "Makaracılar", "Dönücüler", "Form ve süs ırkları"];
  gruplar.sort(function (a, b) { return SIRA.indexOf(a) - SIRA.indexOf(b); });
  arac.setAttribute("role", "group");
  arac.setAttribute("aria-label", "Haritayı ırk grubuna göre süz");
  ["Tümü"].concat(gruplar).forEach(function (g) {
    var b = el("button", "hs", g);
    b.type = "button";
    b.setAttribute("aria-pressed", g === "Tümü" ? "true" : "false");
    b.addEventListener("click", function () { suz(g === "Tümü" ? "" : g); });
    arac.appendChild(b);
  });
  arac.hidden = false;

  function suz(g) {
    grup = g;
    kartiKapat(false);
    Array.prototype.forEach.call(arac.querySelectorAll(".hs"), function (b) {
      b.setAttribute("aria-pressed", (b.textContent === (g || "Tümü")) ? "true" : "false");
    });
    Object.keys(VERI).forEach(function (il) {
      var var_ = !g || VERI[il].irk.some(function (r) { return r.grup === g; });
      Array.prototype.forEach.call(svg.querySelectorAll('[data-il="' + il + '"]'), function (n) {
        n.classList.toggle("sonuk", !var_);
        if (n.tagName.toLowerCase() === "a") {
          if (var_) n.removeAttribute("tabindex"); else n.setAttribute("tabindex", "-1");
          n.setAttribute("aria-hidden", var_ ? "false" : "true");
        }
      });
    });
    bolum.classList.toggle("suzgulu", !!g);
  }

  bolum.classList.add("js");
})();
