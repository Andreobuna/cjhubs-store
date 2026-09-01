function cleanupPwa(){try{'serviceWorker'in navigator&&navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){try{x.unregister()}catch{}})}).catch(function(){})}catch{}try{'caches'in window&&caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x.indexOf('cjhubs-store-')===0||x.indexOf('workbox-')===0}).map(function(x){return caches.delete(x)}))}).catch(function(){})}catch{}}window.cleanupPwa=cleanupPwa;
(function () {
  var root = document.documentElement;
  var started = Date.now();
  var minVisible = 850;
  var maxVisible = 12000;
  var apiBase = 'https://cjhubs-backend.onrender.com';
  var remoteKeys = { cjhubs_products: 1, cjhubs_users: 1, cjhubs_orders: 1, cjhubs_admin: 1 };
  var remoteCache = {};
  var remoteBooted = false;
  var remoteBootPromise = null;

  function storageKey(key) {
    return 'cjhubs_remote_' + key;
  }

  function localRead(key) {
    try {
      var raw = localStorage.getItem(storageKey(key));
      return raw ? JSON.parse(raw) : undefined;
    } catch (e) {
      return undefined;
    }
  }

  function localWrite(key, value) {
    try {
      localStorage.setItem(storageKey(key), JSON.stringify(value));
    } catch (e) {
      // Ignore storage failures.
    }
  }

  function requestJson(method, url, body) {
    try {
      return fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
        credentials: 'omit'
      }).then(function (res) {
        return res.ok ? res.json() : null;
      }).catch(function () {
        return null;
      });
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  function bootstrap() {
    if (remoteBootPromise) return remoteBootPromise;
    remoteBooted = true;
    remoteBootPromise = requestJson('GET', apiBase + '/api/bootstrap').then(function (res) {
      if (!res || !res.ok || !res.collections) return null;
      remoteCache = res.collections;
      Object.keys(res.collections).forEach(function (key) {
        if (remoteKeys[key]) localWrite(key, res.collections[key]);
      });
      return remoteCache;
    });
    return remoteBootPromise;
  }

  function scheduleBootstrap() {
    if (remoteBooted) return;
    remoteBooted = true;
    var runner = function () {
      bootstrap();
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(runner, { timeout: 2000 });
    } else {
      setTimeout(runner, 0);
    }
  }

  window.__CJHUBS_DB__ = {
    isRemoteKey: function (key) {
      return !!remoteKeys[key];
    },
    get: function (key, fallback) {
      if (!remoteKeys[key]) return undefined;
      scheduleBootstrap();
      if (Object.prototype.hasOwnProperty.call(remoteCache, key)) return remoteCache[key];
      var local = localRead(key);
      return local !== undefined ? local : fallback;
    },
    set: function (key, value) {
      if (!remoteKeys[key]) return true;
      scheduleBootstrap();
      remoteCache[key] = value;
      localWrite(key, value);
      requestJson('PUT', apiBase + '/api/state', { collection: key, value: value });
      return true;
    },
    remove: function (key) {
      if (!remoteKeys[key]) return true;
      scheduleBootstrap();
      delete remoteCache[key];
      localWrite(key, null);
      requestJson('PUT', apiBase + '/api/state', { collection: key, value: null });
      return true;
    }
  };

  function buildPreloader() {
    var style = document.createElement('style');
    style.textContent = '' +
      'html.cjh-loading,html.cjh-loading body{overflow:hidden;}' +
      '.cjh-preloader{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 18% 18%,rgba(243,217,128,.18),transparent 20%),radial-gradient(circle at 80% 16%,rgba(255,255,255,.08),transparent 16%),radial-gradient(circle at 50% 100%,rgba(212,175,55,.10),transparent 28%),linear-gradient(135deg,#02040a 0%,#071226 44%,#0a1638 100%);color:#fff;transition:opacity .55s ease,transform .55s ease,visibility .55s ease;backdrop-filter:blur(10px);}' +
      '.cjh-preloader::before,.cjh-preloader::after{content:"";position:absolute;pointer-events:none;border-radius:999px;}' +
      '.cjh-preloader::before{inset:-18%;background:radial-gradient(circle,rgba(212,175,55,.16),transparent 30%);filter:blur(18px);animation:cjhGlow 4.8s ease-in-out infinite;}' +
      '.cjh-preloader::after{width:min(78vw,540px);height:min(78vw,540px);background:radial-gradient(circle,rgba(255,255,255,.04),transparent 66%);opacity:.55;}' +
      '.cjh-preloader__card{position:relative;width:min(92vw,720px);padding:clamp(24px,4vw,40px);border:1px solid rgba(255,255,255,.14);border-radius:30px;background:linear-gradient(180deg,rgba(6,12,24,.84),rgba(5,10,20,.72));box-shadow:0 30px 100px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.04) inset;backdrop-filter:blur(18px);overflow:hidden;}' +
      '.cjh-preloader__card::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.08),transparent 38%,rgba(212,175,55,.08));pointer-events:none;}' +
      '.cjh-preloader__stage{position:relative;display:grid;gap:18px;justify-items:center;text-align:center;}' +
      '.cjh-preloader__chip{display:inline-flex;align-items:center;gap:10px;padding:9px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.9);font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;}' +
      '.cjh-preloader__chip img{width:22px;height:22px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.14);}' +
      '.cjh-preloader__wordmark{font-family:"Playfair Display",Georgia,serif;font-size:clamp(30px,6vw,56px);line-height:1;letter-spacing:.28em;text-indent:.28em;text-transform:uppercase;color:#fff;opacity:0;transform:translateY(14px) scale(.94);animation:cjhWordmark .9s cubic-bezier(.2,.85,.25,1) .05s forwards;}' +
      '.cjh-preloader__halo{position:relative;width:min(40vw,230px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;}' +
      '.cjh-preloader__halo::before{content:"";position:absolute;inset:-4%;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,.22),transparent 62%);filter:blur(2px);animation:cjhPulse 3.8s ease-in-out infinite;}' +
      '.cjh-preloader__ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,255,255,.12);box-shadow:0 0 0 18px rgba(255,255,255,.025),0 0 120px rgba(212,175,55,.12) inset;}' +
      '.cjh-preloader__ring::before{content:"";position:absolute;inset:12px;border-radius:50%;border:2px solid transparent;border-top-color:rgba(243,217,128,.95);border-right-color:rgba(212,175,55,.55);animation:cjhSpin 1.35s linear infinite;}' +
      '.cjh-preloader__ring::after{content:"";position:absolute;inset:28px;border-radius:50%;background:rgba(255,255,255,.05);backdrop-filter:blur(2px);}' +
      '.cjh-preloader__copy{display:grid;gap:8px;justify-items:center;}' +
      '.cjh-preloader__copy h1{margin:0;font-family:"Inter",system-ui,sans-serif;font-size:clamp(20px,3.8vw,30px);line-height:1.15;font-weight:600;color:#fff;}' +
      '.cjh-preloader__copy p{margin:0;max-width:34ch;color:rgba(244,247,255,.82);font-size:clamp(14px,2vw,16px);}' +
      '.cjh-preloader__track{width:min(280px,72vw);height:3px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.06) inset;}' +
      '.cjh-preloader__track span{display:block;height:100%;width:42%;border-radius:inherit;background:linear-gradient(90deg,transparent 0%,rgba(243,217,128,.85) 45%,rgba(212,175,55,1) 50%,rgba(243,217,128,.85) 55%,transparent 100%);animation:cjhSweep 1.6s ease-in-out infinite;}' +
      '.cjh-preloader__status{font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:rgba(255,255,255,.72);}' +
      'html.cjh-ready .cjh-preloader{opacity:0;visibility:hidden;transform:scale(1.02);}' +
      '@media (prefers-reduced-motion: reduce){.cjh-preloader,.cjh-preloader::before,.cjh-preloader__wordmark,.cjh-preloader__halo::before,.cjh-preloader__ring::before,.cjh-preloader__track span{animation:none !important;transition:none !important;}.cjh-preloader__wordmark{opacity:1;transform:none;}}' +
      '@keyframes cjhGlow{0%,100%{opacity:.55;transform:scale(1);}50%{opacity:.9;transform:scale(1.03);}}' +
      '@keyframes cjhWordmark{0%{opacity:0;transform:translateY(14px) scale(.94);}100%{opacity:1;transform:translateY(0) scale(1);}}' +
      '@keyframes cjhSpin{to{transform:rotate(360deg);}}' +
      '@keyframes cjhPulse{0%,100%{transform:scale(1);opacity:.72;}50%{transform:scale(1.04);opacity:1;}}' +
      '@keyframes cjhSweep{0%{transform:translateX(-48%);}50%{transform:translateX(92%);}100%{transform:translateX(-48%);}}';

    var markup = document.createElement('div');
    markup.id = 'cjhubs-preloader';
    markup.className = 'cjh-preloader';
    markup.setAttribute('aria-hidden', 'true');
    markup.innerHTML = '' +
      '<div class="cjh-preloader__card">' +
        '<div class="cjh-preloader__stage">' +
          '<div class="cjh-preloader__chip"><img src="dot.jpg" alt="CJ Hubs" decoding="async">CJ HUBS</div>' +
          '<div class="cjh-preloader__wordmark">CJ HUBS</div>' +
          '<div class="cjh-preloader__halo"><span class="cjh-preloader__ring"></span></div>' +
          '<div class="cjh-preloader__copy">' +
            '<h1>Preparing your shopping experience</h1>' +
            '<p>Loading the catalog, account state, and the latest storefront details.</p>' +
          '</div>' +
          '<div class="cjh-preloader__track"><span></span></div>' +
          '<div class="cjh-preloader__status">Loading</div>' +
        '</div>' +
      '</div>';

    if (document.head) document.head.appendChild(style);
    else document.documentElement.appendChild(style);
    (document.body || document.documentElement).appendChild(markup);
  }
  function finishPreloader() {
    if (hidePreloader.done) return;
    hidePreloader.done = true;
    if (hidePreloader._timer) clearTimeout(hidePreloader._timer);
    if (hidePreloader._safety) clearTimeout(hidePreloader._safety);
    root.classList.add('cjh-ready');
    root.classList.remove('cjh-loading');
    setTimeout(function () {
      var el = document.getElementById('cjhubs-preloader');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 650);
  }
  function hidePreloader() {
    if (hidePreloader.done) return;
    if (hidePreloader._timer) clearTimeout(hidePreloader._timer);
    var delay = Math.max(0, minVisible - (Date.now() - started));
    hidePreloader._timer = setTimeout(finishPreloader, delay);
  }

  root.classList.add('cjh-loading');
  buildPreloader();
  window.__cjhubsHidePreloader = hidePreloader;
  if (document.readyState === 'complete') hidePreloader();
  else window.addEventListener('load', hidePreloader, { once: true });
  hidePreloader._safety = setTimeout(function () {
    if (!hidePreloader.done) finishPreloader();
  }, maxVisible);
}());
