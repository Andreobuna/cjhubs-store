(function () {
  var root = document.documentElement;
  var started = Date.now();
  var minVisible = 900;
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
      '.cjh-preloader{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:radial-gradient(circle at 20% 18%,rgba(243,217,128,.20),transparent 24%),radial-gradient(circle at 80% 26%,rgba(212,175,55,.20),transparent 22%),linear-gradient(135deg,#02040a 0%,#071226 40%,#0a1638 100%);color:#fff;transition:opacity .45s ease,transform .45s ease,visibility .45s ease;}' +
      '.cjh-preloader::before,.cjh-preloader::after{content:"";position:absolute;border-radius:999px;pointer-events:none;}' +
      '.cjh-preloader::before{width:min(70vw,520px);height:min(70vw,520px);background:radial-gradient(circle,rgba(212,175,55,.18),transparent 68%);filter:blur(8px);animation:cjhPulse 3.5s ease-in-out infinite;}' +
      '.cjh-preloader::after{width:160px;height:160px;border:1px solid rgba(255,255,255,.12);box-shadow:0 0 0 18px rgba(255,255,255,.03),0 0 120px rgba(212,175,55,.12) inset;animation:cjhOrbit 8s linear infinite;}' +
      '.cjh-preloader__card{position:relative;width:min(92vw,440px);padding:34px 28px 30px;text-align:center;border:1px solid rgba(255,255,255,.14);border-radius:28px;background:rgba(6,12,24,.72);backdrop-filter:blur(18px);box-shadow:0 24px 80px rgba(0,0,0,.42);}' +
      '.cjh-preloader__logo-wrap{position:relative;width:136px;height:136px;margin:0 auto 18px;display:grid;place-items:center;}' +
      '.cjh-preloader__ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(255,255,255,.12);border-top-color:rgba(243,217,128,.95);border-right-color:rgba(212,175,55,.55);animation:cjhSpin 1.25s linear infinite;}' +
      '.cjh-preloader__ring.two{inset:14px;animation-duration:2.1s;animation-direction:reverse;}' +
      '.cjh-preloader__mark{position:relative;width:84px;height:84px;border-radius:26px;overflow:hidden;background:rgba(255,255,255,.05);box-shadow:0 18px 44px rgba(0,0,0,.28);}' +
      '.cjh-preloader__mark img{width:100%;height:100%;object-fit:cover;animation:cjhFloat 2.8s ease-in-out infinite,cjhSpin 10s linear infinite;}' +
      '.cjh-preloader__title{margin:0 0 6px;font-family:"Playfair Display",Georgia,serif;font-size:clamp(26px,4vw,34px);line-height:1.05;color:#fff;}' +
      '.cjh-preloader__subtitle{margin:0;color:rgba(242,245,255,.76);font-size:14px;letter-spacing:.22px;}' +
      '.cjh-preloader__bars{display:flex;justify-content:center;gap:8px;margin-top:20px;}' +
      '.cjh-preloader__bars span{width:10px;height:10px;border-radius:999px;background:linear-gradient(180deg,#f3d980,#d4af37);box-shadow:0 0 18px rgba(212,175,55,.5);animation:cjhDot 1.05s ease-in-out infinite;}' +
      '.cjh-preloader__bars span:nth-child(2){animation-delay:.12s;}' +
      '.cjh-preloader__bars span:nth-child(3){animation-delay:.24s;}' +
      '.cjh-preloader__bars span:nth-child(4){animation-delay:.36s;}' +
      '.cjh-preloader__bars span:nth-child(5){animation-delay:.48s;}' +
      'html.cjh-ready .cjh-preloader{opacity:0;visibility:hidden;transform:scale(1.02);}' +
      '@keyframes cjhSpin{to{transform:rotate(360deg);}}' +
      '@keyframes cjhPulse{0%,100%{opacity:.7;transform:scale(1);}50%{opacity:1;transform:scale(1.03);}}' +
      '@keyframes cjhFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-6px) scale(1.02);}}' +
      '@keyframes cjhDot{0%,100%{transform:translateY(0);opacity:.4;}50%{transform:translateY(-10px);opacity:1;}}' +
      '@keyframes cjhOrbit{to{transform:rotate(360deg);}}' +
      '@media (max-width:640px){.cjh-preloader__card{width:min(90vw,360px);padding:28px 20px 24px;border-radius:24px;}.cjh-preloader__logo-wrap{width:118px;height:118px;}}';

    var markup = document.createElement('div');
    markup.id = 'cjhubs-preloader';
    markup.className = 'cjh-preloader';
    markup.setAttribute('aria-hidden', 'true');
    markup.innerHTML = '' +
      '<div class="cjh-preloader__card">' +
        '<div class="cjh-preloader__logo-wrap">' +
          '<span class="cjh-preloader__ring"></span>' +
          '<span class="cjh-preloader__ring two"></span>' +
          '<div class="cjh-preloader__mark"><img src="dot.jpg" alt="CJ Hubs" decoding="async"></div>' +
        '</div>' +
        '<h1 class="cjh-preloader__title">CJ Hubs Store</h1>' +
        '<p class="cjh-preloader__subtitle">Curating your products, deals, and gifts.</p>' +
        '<div class="cjh-preloader__bars"><span></span><span></span><span></span><span></span><span></span></div>' +
      '</div>';

    if (document.head) document.head.appendChild(style);
    else document.documentElement.appendChild(style);
    (document.body || document.documentElement).appendChild(markup);
  }

  function hidePreloader() {
    if (hidePreloader.done) return;
    hidePreloader.done = true;
    var delay = Math.max(0, minVisible - (Date.now() - started));
    setTimeout(function () {
      root.classList.add('cjh-ready');
      root.classList.remove('cjh-loading');
      setTimeout(function () {
        var el = document.getElementById('cjhubs-preloader');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 600);
    }, delay);
  }

  root.classList.add('cjh-loading');
  buildPreloader();
  window.__cjhubsHidePreloader = hidePreloader;
  window.addEventListener('load', hidePreloader);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
    });
  }
}());
