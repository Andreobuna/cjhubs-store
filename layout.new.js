/* ============================================================
   CJ HUBS STORE - SHARED LAYOUT (header / footer / utilities)
   ============================================================ */

function getStoredTheme() {
  try {
    return localStorage.getItem('cjhubs-theme');
  } catch {
    return null;
  }
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const resolved = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', resolved);
  try {
    localStorage.setItem('cjhubs-theme', resolved);
  } catch {
    // Ignore storage failures and keep the theme in-memory.
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const label = resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initThemeMode() {
  applyTheme(getPreferredTheme());
}

function injectLayoutStyles() {
  if (document.getElementById('cjhubs-layout-overrides')) return;

  const style = document.createElement('style');
  style.id = 'cjhubs-layout-overrides';
  style.textContent = `
.topbar{display:none !important;}
.main-header .container{
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:18px;
}
.logo{white-space:nowrap;}
.logo .brand-name{display:inline-flex;align-items:center;gap:8px;min-width:0;}
.main-nav{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:10px 16px;
  flex-wrap:wrap;
  min-width:0;
}
.main-nav a{
  padding:10px 14px;
  border-radius:999px;
}
.main-nav a::after{display:none;}
.main-nav a:hover,
.main-nav a.active{
  background:rgba(212,175,55,.12);
  color:var(--gold);
  box-shadow:0 0 0 1px rgba(212,175,55,.18) inset;
}
  .mobile-category-strip{display:none;}
.header-actions{
  margin-left:auto;
  justify-content:flex-end;
  flex-wrap:wrap;
  gap:12px;
}
body.home-page{
  background:#07101f;
  color:#f5f7ff;
}
body.home-page .hero{
  position:relative;
  overflow:hidden;
  background:
    linear-gradient(180deg, rgba(6,12,24,.18), rgba(6,12,24,.66)),
    url('web.png') center top / cover no-repeat;
  padding:clamp(72px, 10vw, 118px) 0 clamp(56px, 7vw, 88px);
}
body.home-page .hero::before{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(180deg, rgba(4,8,18,.10), rgba(4,8,18,.52));
  pointer-events:none;
}
body.home-page .hero .container{
  position:relative;
  z-index:1;
  align-items:center;
}
body.home-page .hero .container > div:first-child{
  background:transparent;
  border:none;
  box-shadow:none;
  padding:0;
  max-width:760px;
}
body.home-page .hero h1,
body.home-page .hero p.lead,
body.home-page .hero-stats strong,
body.home-page .hero-stats span,
body.home-page .hero-badge{
  text-shadow:0 8px 22px rgba(0,0,0,.35);
}
body.home-page .hero-badge{
  background:rgba(8,14,30,.45);
  border-color:rgba(255,255,255,.18);
  color:#fff;
  backdrop-filter:blur(10px);
}
body.home-page .hero p.lead,
body.home-page .hero-stats span{
  color:rgba(245,247,255,.84);
}
body.home-page .hero-stats div{border-left-color:var(--gold-light);}
body.home-page .hero-visual{min-height:460px;}
body.home-page .hero-visual .hero-product-card,
body.home-page .hero-visual .badge-offer{
  background:rgba(8,14,30,.54);
  border:1px solid rgba(255,255,255,.12);
}
body.home-page .hero-product-meta{
  background:rgba(5,10,20,.82);
  border:1px solid rgba(255,255,255,.10);
}
body.home-page .section,
body.home-page .newsletter{
  background:rgba(248,249,251,.90);
}
body.home-page .section-head h2,
body.home-page .section-head p,
body.home-page .pc-name,
body.home-page .pc-price .now,
body.home-page .pc-stock,
body.home-page .newsletter h3,
body.home-page .newsletter p{
  color:var(--navy);
}
@media (max-width: 900px){
  .main-header .container{display:flex;align-items:center;justify-content:space-between;gap:14px;}
  .main-nav{display:none;}
  .search-box{display:none;}
  .hamburger{display:flex;}
  .mobile-category-strip{display:flex;gap:10px;align-items:center;overflow-x:auto;padding:10px 16px 14px;background:linear-gradient(180deg, rgba(7,16,31,.96), rgba(7,16,31,.88));border-bottom:1px solid rgba(255,255,255,.08);scrollbar-width:none;}
  .mobile-category-strip::-webkit-scrollbar{display:none;}
  .mobile-category-strip a{flex:0 0 auto;padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);color:#f4f7ff;font-size:13px;font-weight:700;letter-spacing:.2px;white-space:nowrap;}
  .mobile-category-strip a:hover{background:rgba(212,175,55,.14);border-color:rgba(212,175,55,.28);color:var(--gold-light);}
  body.home-page{background-attachment:scroll;background-position:center top;}
  body.home-page .hero::before{background:linear-gradient(180deg, rgba(4,8,18,.06), rgba(4,8,18,.26));}
  body.home-page .hero .container > div:first-child{background:rgba(8,14,30,.52);backdrop-filter:blur(8px);}
  body.home-page .hero .container{grid-template-columns:1fr;}
  body.home-page .hero-visual{min-height:auto;margin-top:18px;}
}
@media (max-width: 640px){
  .logo{font-size:21px;}
  .main-header .container{padding-top:14px;padding-bottom:14px;}
  .hero-cta .btn{width:100%;}
  body.home-page .hero .container > div:first-child{max-width:none;}
  body.home-page .hero-stats{gap:14px;flex-wrap:wrap;}
}
  `;
