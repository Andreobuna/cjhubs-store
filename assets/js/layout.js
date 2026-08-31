/* ============================================================
   CJ HUBS STORE - SHARED LAYOUT (header / footer / utilities)
   ============================================================ */

function applyTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  try {
    localStorage.setItem('cjhubs-theme', 'dark');
  } catch {
    // Ignore storage failures
  }
}

function injectLayoutStyles() {
  if (document.getElementById('cjhubs-layout-overrides')) return;

  const style = document.createElement('style');
  style.id = 'cjhubs-layout-overrides';
  style.textContent = `
.topbar{display:none !important;}
body.home-page #site-header .main-nav{display:flex !important;}
body.home-page #site-header .search-box{display:flex !important;}
body.home-page #site-header .icon-btn:not(.theme-toggle){display:flex !important;}
body.home-page #site-header .header-actions a[href="cart.html"]{display:none !important;}
body.home-page #site-header .hamburger{display:flex !important;align-items:center;justify-content:center;width:44px;height:44px;border-radius:14px;background:rgba(10,22,56,.92);border:1px solid rgba(255,255,255,.10);box-shadow:0 10px 24px rgba(10,22,56,.18);color:#fff;}
body.home-page #site-header .hamburger span{display:block;width:20px;background:#fff;}
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
  background:linear-gradient(180deg,#050a14 0%, #07101f 42%, #081629 100%);
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
  background:rgba(10,22,56,.92);
  border-color:rgba(255,255,255,.10);
  color:#fff;
  box-shadow:0 10px 24px rgba(10,22,56,.18);
}
body.home-page .hero p.lead,
body.home-page .hero-stats span{
  color:rgba(245,247,255,.84);
}
body.home-page .hero-stats div{border-left-color:var(--gold-light);}
body.home-page .hero-visual{min-height:460px;}
body.home-page .hero-visual .hero-product-card,
body.home-page .hero-visual .badge-offer{
  background:rgba(10,22,56,.94);
  border:1px solid rgba(255,255,255,.10);
}
body.home-page .hero-product-meta{
  background:rgba(6,12,24,.94);
  border:1px solid rgba(255,255,255,.10);
}
body.home-page .section{
  background:rgba(248,249,251,.90);
}
body.home-page .newsletter{
  background:var(--navy);
}
html[data-theme='dark'] body.home-page .section,
html[data-theme='dark'] body.home-page .newsletter{
  background:#091224;
}
html[data-theme='dark'] body.home-page .product-card,
html[data-theme='dark'] body.home-page .cat-card,
html[data-theme='dark'] body.home-page .filters-panel,
html[data-theme='dark'] body.home-page .admin-panel,
html[data-theme='dark'] body.home-page .stat-card{
  background:#0d1729;
}
body.home-page .section-head h2,
body.home-page .section-head p{
  color:#fff;
}
body.home-page .pc-name,
body.home-page .pc-price .now,
body.home-page .pc-stock{
  color:#fff;
}
body.home-page .newsletter h3,
body.home-page .newsletter p{
  color:#fff;
}
@media (max-width: 900px){
  .main-header .container{display:flex;align-items:center;justify-content:space-between;gap:14px;}
  .main-nav{display:none;}
  .hamburger{display:flex;}
  .mobile-category-strip{display:flex;gap:10px;align-items:center;overflow-x:auto;padding:10px 16px 14px;background:linear-gradient(180deg, rgba(7,16,31,.96), rgba(7,16,31,.88));border-bottom:1px solid rgba(255,255,255,.08);scrollbar-width:none;}
  .mobile-category-strip::-webkit-scrollbar{display:none;}
  .mobile-category-strip a{flex:0 0 auto;padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);color:#f4f7ff;font-size:13px;font-weight:700;letter-spacing:.2px;white-space:nowrap;}
  .mobile-category-strip a:hover{background:rgba(212,175,55,.14);border-color:rgba(212,175,55,.28);color:var(--gold-light);}
  body.home-page{background-attachment:scroll;background-position:center top;}
  body.home-page .hero::before{background:linear-gradient(180deg, rgba(4,8,18,.06), rgba(4,8,18,.26));}
  body.home-page .hero .container > div:first-child{background:transparent;backdrop-filter:none;}
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
  document.head.appendChild(style);
}

function siteHeaderHTML(active) {
  const user = Auth.currentUser();
  const link = (href, label, key) => `<a href="${href}" class="${active===key?'active':''}">${label}</a>`;
  return `
  <header class="main-header">
    <div class="container">
      <a href="index.html" class="logo"><img src="dot.jpg" alt="Logo" style="height:40px;width:auto;"></a>
      <div class="header-actions">
        <a href="${user ? 'account.html' : 'login.html'}" class="icon-btn" title="${user ? 'My Account' : 'Login'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
        <a href="cart.html" class="icon-btn" title="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-count" id="cartCount">0</span>
        </a>
        <div class="hamburger" onclick="document.getElementById('mobileNav').classList.add('open')">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </header>
  <div class='mobile-category-strip' aria-label='Quick category links'>
    <a href='shop.html'>Shop</a>
    <a href='gift-ideas.html'>Gift Ideas</a>
    <a href='products-accessories.html'>Products &amp; Accessories</a>
  </div>
  <div class="mobile-nav" id="mobileNav">
    <div class="close-mobile" onclick="document.getElementById('mobileNav').classList.remove('open')">&times;</div>
    <form onsubmit="event.preventDefault(); if(this.q.value.trim()) window.location.href='shop.html?search='+encodeURIComponent(this.q.value);" style="margin-bottom:20px;">
      <input name="q" type="search" placeholder="Search products..." style="width:100%;padding:12px 16px;border-radius:8px;border:none;">
    </form>
    <a href="index.html">Home</a>
    <a href="shop.html">Shop</a>
    <a href="gift-ideas.html">Gift Ideas</a>
    <a href="products-accessories.html">Products &amp; Accessories</a>
    <a href="shop.html?offer=1">Special Offers</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
    <a href="${user ? 'account.html' : 'login.html'}">${user ? 'My Account' : 'Login / Register'}</a>
    <a href="cart.html">Cart (<span id="mobileCartCount">0</span>)</a>
  </div>`;
}

function siteFooterHTML() {
  return `
  <div class="footer-top">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo" style="margin-bottom:14px;"><img src="dot.jpg" alt="Logo" style="height:40px;width:auto;"></a>
        <p>A modern shopping destination for thoughtful gifts and everyday essentials - curated with care, delivered with pride.</p>
        <div class="social-row">
          <a href="#" title="Facebook">f</a>
          <a href="#" title="Instagram">ig</a>
          <a href="#" title="Twitter/X">x</a>
          <a href="#" title="Pinterest">p</a>
        </div>
      </div>
      <div>
        <h4>Shop</h4>
        <ul>
          <li><a href="shop.html">All Products</a></li>
          <li><a href="gift-ideas.html">Gift Ideas</a></li>
          <li><a href="products-accessories.html">Products &amp; Accessories</a></li>
          <li><a href="shop.html?offer=1">Special Offers</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="account.html">My Account</a></li>
        </ul>
      </div>
      <div>
        <h4>Customer Care</h4>
        <ul>
          <li><a href="contact.html">Support Center</a></li>
          <li><a href="contact.html">Shipping Info</a></li>
          <li><a href="#" onclick="return false;">Privacy Policy</a></li>
          <li><a href="#" onclick="return false;">Terms &amp; Conditions</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom">
      <span>&copy; ${new Date().getFullYear()} CJ Hubs Store. All rights reserved.</span>
      <span><a href="#" onclick="return false;">Privacy</a><a href="#" onclick="return false;">Terms</a></span>
    </div>
  </div>`;
}

function renderLayout(active) {
  const h = document.getElementById('site-header');
  const f = document.getElementById('site-footer');
  if (h) h.innerHTML = siteHeaderHTML(active);
  if (f) f.innerHTML = siteFooterHTML();
  injectLayoutStyles();
  applyTheme();
  updateCartCount();
  if (typeof cleanupPwa === 'function') cleanupPwa();
}

function updateCartCount() {
  const n = Cart.count();
  document.querySelectorAll('#cartCount, #mobileCartCount').forEach(el => el.textContent = n);
}

function showToast(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="tick">?</span><span id="toastMsg"></span>`;
    document.body.appendChild(toast);
  }
  document.getElementById('toastMsg').textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e=>e.classList.add('in')); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(e => obs.observe(e));
}

document.addEventListener('DOMContentLoaded', initScrollReveal);








