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
      '.cjh-preloader{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 20% 18%,rgba(243,217,128,.18),transparent 20%),radial-gradient(circle at 80% 18%,rgba(255,255,255,.08),transparent 18%),linear-gradient(135deg,#02040a 0%,#071226 40%,#0a1638 100%);color:#fff;transition:opacity .45s ease,transform .45s ease,visibility .45s ease;backdrop-filter:blur(8px);}' +
      '.cjh-preloader::before,.cjh-preloader::after{content:"";position:absolute;border-radius:999px;pointer-events:none;}' +
      '.cjh-preloader::before{width:min(72vw,560px);height:min(72vw,560px);background:radial-gradient(circle,rgba(212,175,55,.16),transparent 68%);filter:blur(8px);animation:cjhPulse 3.8s ease-in-out infinite;}' +
      '.cjh-preloader::after{width:180px;height:180px;border:1px solid rgba(255,255,255,.12);box-shadow:0 0 0 18px rgba(255,255,255,.03),0 0 120px rgba(212,175,55,.12) inset;animation:cjhOrbit 8s linear infinite;}' +
      '.cjh-preloader__card{position:relative;width:min(92vw,680px);padding:clamp(22px,4vw,36px);text-align:left;border:1px solid rgba(255,255,255,.14);border-radius:30px;background:rgba(6,12,24,.72);box-shadow:0 28px 90px rgba(0,0,0,.42);backdrop-filter:blur(18px);}' +
      '.cjh-preloader__layout{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center;}' +
      '.cjh-preloader__copy h1{margin:0 0 10px;font-family:"Playfair Display",Georgia,serif;font-size:clamp(28px,5vw,52px);line-height:1.02;color:#fff;}' +
      '.cjh-preloader__copy p{margin:0;max-width:42ch;color:rgba(244,247,255,.82);font-size:clamp(14px,2vw,16px);}' +
      '.cjh-preloader__visual{display:grid;place-items:center;min-width:150px;}' +
      '.cjh-preloader__orbit{position:relative;width:124px;height:124px;border-radius:50%;border:2px solid rgba(255,255,255,.12);border-top-color:rgba(243,217,128,.95);border-right-color:rgba(212,175,55,.55);animation:cjhSpin 1.25s linear infinite;}' +
      '.cjh-preloader__orbit::before,.cjh-preloader__orbit::after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.14);}' +
      '.cjh-preloader__orbit::before{inset:14px;animation:cjhSpin 2.2s linear infinite reverse;}' +
      '.cjh-preloader__orbit::after{inset:28px;background:rgba(255,255,255,.05);}' +
      '.cjh-preloader__strip{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;}' +
      '.cjh-preloader__mini{width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08);position:relative;overflow:hidden;}' +
      '.cjh-preloader__mini::before{content:"";position:absolute;inset:12px;border-radius:14px;background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.05));animation:cjhFloat 2.4s ease-in-out infinite;}' +
      '.cjh-preloader__mini:nth-child(2){transform:translateY(8px);}' +
      '.cjh-preloader__mini:nth-child(3){transform:translateY(-4px);}' +
      '.cjh-preloader__chip{display:inline-flex;align-items:center;gap:8px;width:fit-content;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.86);font-size:12px;font-weight:700;letter-spacing:.2px;margin-bottom:16px;}' +
      '.cjh-preloader__bars{display:flex;gap:8px;align-items:center;margin-top:18px;}' +
      '.cjh-preloader__bars span{width:10px;height:10px;border-radius:50%;background:linear-gradient(180deg,#f3d980,#d4af37);box-shadow:0 0 14px rgba(212,175,55,.55);animation:cjhDot 1s ease-in-out infinite;}' +
      '.cjh-preloader__bars span:nth-child(2){animation-delay:.12s;}.cjh-preloader__bars span:nth-child(3){animation-delay:.24s;}.cjh-preloader__bars span:nth-child(4){animation-delay:.36s;}.cjh-preloader__bars span:nth-child(5){animation-delay:.48s;}' +
      'html.cjh-ready .cjh-preloader{opacity:0;visibility:hidden;transform:scale(1.02);}' +
      '@keyframes cjhSpin{to{transform:rotate(360deg);}}' +
      '@keyframes cjhPulse{0%,100%{opacity:.7;transform:scale(1);}50%{opacity:1;transform:scale(1.03);}}' +
      '@keyframes cjhFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-6px) scale(1.02);}}' +
      '@keyframes cjhDot{0%,100%{transform:translateY(0);opacity:.45;}50%{transform:translateY(-8px);opacity:1;}}' +
      '@keyframes cjhOrbit{to{transform:rotate(360deg);}}' +
      '@media (max-width:640px){.cjh-preloader__card{width:min(96vw,540px);padding:22px 18px;border-radius:24px;}.cjh-preloader__layout{grid-template-columns:1fr;text-align:center;}.cjh-preloader__copy p{margin-inline:auto;}.cjh-preloader__visual{order:-1;min-width:0;}.cjh-preloader__strip{justify-content:center;}}';

    var markup = document.createElement('div');
    markup.id = 'cjhubs-preloader';
    markup.className = 'cjh-preloader';
    markup.setAttribute('aria-hidden', 'true');
    markup.innerHTML = '' +
      '<div class="cjh-preloader__card">' +
        '<div class="cjh-preloader__layout">' +
          '<div class="cjh-preloader__copy">' +
            '<div class="cjh-preloader__chip"><img src="dot.jpg" alt="CJ Hubs" decoding="async" style="width:20px;height:20px;border-radius:50%;object-fit:cover;"> CJ Hubs Store</div>' +
            '<h1>Loading your storefront.</h1>' +
            '<p>Products, deals, and collections are being prepared in a polished responsive shell.</p>' +
            '<div class="cjh-preloader__bars"><span></span><span></span><span></span><span></span><span></span></div>' +
            '<div class="cjh-preloader__strip"><span class="cjh-preloader__mini"></span><span class="cjh-preloader__mini"></span><span class="cjh-preloader__mini"></span></div>' +
          '</div>' +
          '<div class="cjh-preloader__visual"><div class="cjh-preloader__orbit"><img src="dot.jpg" alt="CJ Hubs" decoding="async"></div></div>' +
        '</div>' +
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

}());
