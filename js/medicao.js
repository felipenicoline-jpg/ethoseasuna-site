/* Medição da LP Black Friday do Primeiro Apê (Ethos e Asuna).
   1) Pixel da Meta carregado logo na abertura da página (antes ele esperava o navegador ficar ocioso).
   2) Microsoft Clarity (gravação de sessões e mapas de calor).
   3) Ações que o site já registrava passam a ir também para o Meta e o Clarity.
   O script principal (BF) continua igual: se o fbq já existir, ele não inicia o pixel de novo. */
(function (w, d) {
  "use strict";
  var PIXEL = "1149341244516268";
  var CLARITY = "zftp7k24z6";

  function add(src) {
    var s = d.createElement("script");
    s.async = true;
    s.src = src;
    (d.head || d.documentElement).appendChild(s);
  }

  // 1) Pixel da Meta, já na abertura
  try {
    if (!w.fbq) {
      var f = (w.fbq = function () {
        f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments);
      });
      f.push = f;
      f.loaded = true;
      f.version = "2.0";
      f.queue = [];
      w._fbq = f;
      add("https://connect.facebook.net/en_US/fbevents.js");
      w.fbq("init", PIXEL);
      w.fbq("track", "PageView");
    }
  } catch (e) {}

  // 2) Microsoft Clarity
  try {
    w.clarity = w.clarity || function () {
      (w.clarity.q = w.clarity.q || []).push(arguments);
    };
    add("https://www.clarity.ms/tag/" + CLARITY);
  } catch (e) {}

  // Origem da visita (UTM da URL ou, na página "quase lá", a origem guardada pelo site)
  try {
    var q = new URLSearchParams(w.location.search), o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = q.get(k);
      if (v) o[k] = v.slice(0, 100);
    });
    if (!o.utm_source) {
      var g = JSON.parse(w.localStorage.getItem("bfpa_origem") || "null");
      if (g) ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
        if (g[k]) o[k] = String(g[k]).slice(0, 100);
      });
    }
    if (!o.utm_source && q.get("fbclid")) o.utm_source = "meta (fbclid)";
    if (!o.utm_source) o.utm_source = "sem utm";
    for (var k in o) w.clarity("set", k, o[k]);
  } catch (e) {}

  // 3) Ações registradas pelo site (BF.evento grava em dataLayer)
  var umaVez = {};
  function primeiraVez(chave) {
    if (umaVez[chave]) return false;
    umaVez[chave] = true;
    try {
      if (w.sessionStorage.getItem("bfpa_m_" + chave)) return false;
      w.sessionStorage.setItem("bfpa_m_" + chave, "1");
    } catch (e) {}
    return true;
  }

  function trata(ev) {
    if (!ev || typeof ev !== "object" || typeof ev.event !== "string") return;
    var nome = ev.event;
    try { w.clarity("event", nome); } catch (e) {}
    try {
      if (!w.fbq) return;
      if (nome === "abrir_formulario" && primeiraVez("ic")) {
        w.fbq("track", "InitiateCheckout", { content_name: "Black Friday do Primeiro Apê", botao: ev.botao || "" });
      } else if (nome === "video_cliente" && primeiraVez("v_" + (ev.botao || ""))) {
        w.fbq("trackCustom", "TocouVideoCliente", { video: ev.botao || "" });
      } else if (nome === "lead_erro") {
        w.fbq("trackCustom", "ErroCadastro", { erro: ev.erro || "" });
      }
    } catch (e) {}
  }

  try {
    var dl = (w.dataLayer = w.dataLayer || []);
    for (var i = 0; i < dl.length; i++) trata(dl[i]);
    var push = dl.push;
    dl.push = function () {
      for (var j = 0; j < arguments.length; j++) trata(arguments[j]);
      return push.apply(dl, arguments);
    };
  } catch (e) {}
})(window, document);
