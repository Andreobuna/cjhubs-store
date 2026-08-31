/* ============================================================
   CJ HUBS STORE � APP LOGIC
   Product cards, shop grid, filters, product detail, cart,
   checkout, account pages.
   ============================================================ */

/* ---------- product card markup ---------- */
function productCardHTML(p) {
  // Skip invalid or malformed products
  if (!p || typeof p !== 'object' || !p.id) {
    return '';
  }
  
  const wished = Wishlist.has(p.id);
  const discountPct = p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
  const outOfStock = (p.stock || 0) <= 0;
  const catName = CATEGORIES.find(c => c.id === p.category)?.name || '';
  const imgSrc = productImageSrc(p, 0, 700, 700);
  const name = (p.name || 'Product').replace(/"/g, '&quot;');
  const price = p.price || 0;
  const salePrice = p.salePrice || null;
  
  return `
  <div class="product-card reveal in">
    <a href="product.html?id=${p.id}" class="pc-img">
      ${salePrice ? `<span class="pc-badge">-${discountPct}%</span>` : (p.featured ? `<span class="pc-badge featured">Featured</span>` : '')}
      <img src="${imgSrc}" alt="${name}" loading="lazy" onerror="handleImageError(this,700,700)">
    </a>
    <button class="pc-wish ${wished?'active':''}" onclick="toggleWishFromCard(event,'${p.id}')" title="Wishlist">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${wished?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
    </button>
    <div class="pc-body">
      <div class="pc-cat">${catName}</div>
      <a href="product.html?id=${p.id}"><div class="pc-name">${name}</div></a>
      <div class="pc-price">
        <span class="now">${formatPrice(salePrice ?? price)}</span>
        ${salePrice ? `<span class="was">${formatPrice(price)}</span>` : ''}
      </div>
      <div class="pc-stock ${outOfStock?'out':''}">${outOfStock ? 'Out of stock' : (p.stock <= 5 ? `Only ${p.stock} left` : 'In stock')}</div>
      <div class="pc-actions">
        <button class="btn btn-navy" ${outOfStock?'disabled':''} onclick="quickAddToCart('${p.id}')"><span class="desktop-text">Add to Cart</span><span class="mobile-text">Buy</span></button>
        <a href="product.html?id=${p.id}" class="btn btn-outline">View</a>
      </div>
    </div>
  </div>`;
}

function toggleWishFromCard(e, id) {
  e.preventDefault(); e.stopPropagation();
  const active = Wishlist.toggle(id);
  e.currentTarget.classList.toggle('active', active);
  e.currentTarget.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
  showToast(active ? 'Added to wishlist' : 'Removed from wishlist');
}

function quickAddToCart(id) {
  const p = Products.byId(id);
  if (!p || p.stock <= 0) return;
  Cart.add(id, null, 1);
  updateCartCount();
  showToast(`${p.name} added to cart`);
}

function loadingGrid(n, label = 'Loading products') {
  const phases = ['Fetching product visuals', 'Syncing live deals', 'Polishing details', 'Preparing checkout-ready cards'];
  return Array.from({ length: n }).map((_, i) => {
    const delay = i * 90;
    const phase = phases[i % phases.length];
    const ready = Math.min(92, 36 + i * 8);
    return `
      <div class="loader-card reveal in" style="animation-delay:${delay}ms">
        <div class="loader-card__inner">
          <div class="loader-card__top">
            <div class="loader-card__meta">
              <span class="loader-chip">${label}</span>
              <div class="loader-lines">
                <span class="loader-line"></span>
                <span class="loader-line short"></span>
                <span class="loader-line tiny"></span>
              </div>
              <div class="loader-status">${phase}</div>
            </div>
            <div class="loader-orbit loader-orbit--compact" aria-hidden="true">
              <span class="loader-orbit__ring loader-orbit__ring--outer"></span>
              <span class="loader-orbit__ring loader-orbit__ring--inner"></span>
              <img src="dot.jpg" alt="CJ Hubs" decoding="async">
            </div>
          </div>
          <div class="loader-meter"><span style="width:${ready}%"></span></div>
          <div class="loader-dots"><span></span><span></span><span></span></div>
        </div>
      </div>
    `;
  }).join("");
}

function initHomePage(){const featuredEl=document.getElementById("featuredGrid");const newEl=document.getElementById("newArrivalsGrid");const offersEl=document.getElementById("offersGrid");if(featuredEl)featuredEl.innerHTML=loadingGrid(4, 'Loading featured products');if(newEl)newEl.innerHTML=loadingGrid(4, 'Loading new arrivals');if(offersEl)offersEl.innerHTML=loadingGrid(3, 'Loading special offers');setTimeout(()=>{const featured=Products.featured().slice(0,8);const arrivals=Products.newArrivals(8);const offers=Products.specialOffers().slice(0,6);if(featuredEl)featuredEl.innerHTML=featured.length?featured.map(productCardHTML).join(""):emptyStateHTML("Featured","No featured products yet","Check back soon - new items are added regularly.");if(newEl)newEl.innerHTML=arrivals.length?arrivals.map(productCardHTML).join(""):emptyStateHTML("Products","No products yet","The catalog is being updated.");if(offersEl)offersEl.innerHTML=offers.length?offers.map(productCardHTML).join(""):emptyStateHTML("Offers","No special offers right now","Explore the full shop for great products.");document.querySelectorAll(".reveal").forEach(el=>el.classList.add("in"))},300)}

function emptyStateHTML(icon, title, sub, ctaHref, ctaLabel) {
  return `<div class="empty-state" style="grid-column:1/-1;">
    <div class="icon">${icon}</div>
    <h3>${title}</h3>
    <p>${sub}</p>
    ${ctaHref ? `<a href="${ctaHref}" class="btn btn-gold">${ctaLabel}</a>` : ''}
  </div>`;
}

/* ---------- shop / category listing page ---------- */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function initShopPage(fixedCategory) {
  const grid = document.getElementById('productGrid');
  const resultCount = document.getElementById('resultCount');
  const toolbarSearch = document.getElementById('toolbarSearch');
  const sortSelect = document.getElementById('sortSelect');
  const availFilter = document.getElementById('filterAvailability');
  const featuredFilter = document.getElementById('filterFeatured');
  const offerFilter = document.getElementById('filterOffer');
  const catFilterWrap = document.getElementById('catFilterWrap');
  const minPriceEl = document.getElementById('minPrice');
  const maxPriceEl = document.getElementById('maxPrice');
  const clearBtn = document.getElementById('clearFilters');

  const initialSearch = getQueryParam('search') || '';
  const initialOffer = getQueryParam('offer') === '1';
  if (toolbarSearch) toolbarSearch.value = initialSearch;
  if (offerFilter && initialOffer) offerFilter.checked = true;

  function currentCategoryFilters() {
    if (!catFilterWrap) return null;
    const checked = Array.from(catFilterWrap.querySelectorAll('input:checked')).map(i => i.value);
    return checked.length ? checked : null;
  }

  function render() {
    grid.innerHTML = loadingGrid(8, 'Loading products');
    setTimeout(() => {
      try {
        let list = fixedCategory
          ? Products.all().filter(p => p.category === fixedCategory)
          : Products.all();

      const q = (toolbarSearch?.value || '').trim().toLowerCase();
      if (q) {
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
      }
      const cats = currentCategoryFilters();
      if (cats && !fixedCategory) list = list.filter(p => cats.includes(p.category));
      if (availFilter && availFilter.checked) list = list.filter(p => p.stock > 0);
      if (featuredFilter && featuredFilter.checked) list = list.filter(p => p.featured);
      if (offerFilter && offerFilter.checked) list = list.filter(p => p.specialOffer);
      const minP = parseFloat(minPriceEl?.value); const maxP = parseFloat(maxPriceEl?.value);
      if (!isNaN(minP)) list = list.filter(p => (p.salePrice ?? p.price) >= minP);
      if (!isNaN(maxP)) list = list.filter(p => (p.salePrice ?? p.price) <= maxP);

      const sortVal = sortSelect?.value || 'newest';
      list = [...list];
      if (sortVal === 'newest') list.sort((a,b)=>b.createdAt-a.createdAt);
      else if (sortVal === 'price-asc') list.sort((a,b)=>(a.salePrice??a.price)-(b.salePrice??b.price));
      else if (sortVal === 'price-desc') list.sort((a,b)=>(b.salePrice??b.price)-(a.salePrice??a.price));
      else if (sortVal === 'name') list.sort((a,b)=>a.name.localeCompare(b.name));
      else if (sortVal === 'popular') list.sort((a,b)=>(b.featured===true)-(a.featured===true));

      if (resultCount) resultCount.textContent = `${list.length} product${list.length!==1?'s':''} found`;
      grid.innerHTML = list.length ? list.map(productCardHTML).join('') :
        emptyStateHTML('🔍', 'No products found', 'Try adjusting your search or filters.', fixedCategory ? null : 'shop.html', 'View All Products');
      } catch (e) {
        console.error('Shop render error', e);
        grid.innerHTML = emptyStateHTML('?', 'Products failed to load', 'An error occurred while loading products. Check console for details.');
      }
    }, 220);
  }

  [toolbarSearch, sortSelect, availFilter, featuredFilter, offerFilter, minPriceEl, maxPriceEl].forEach(el => {
    if (!el) return;
    el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', render);
  });
  if (catFilterWrap) catFilterWrap.addEventListener('change', render);
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (toolbarSearch) toolbarSearch.value = '';
    if (minPriceEl) minPriceEl.value = '';
    if (maxPriceEl) maxPriceEl.value = '';
    document.querySelectorAll('.filters-panel input').forEach(i => i.checked = false);
    render();
  });

  render();
}

/* ---------- product detail page ---------- */
let PD_STATE = { selectedVariants: {}, qty: 1, activeImage: 0 };

function initProductPage() {
  const id = getQueryParam('id');
  const wrap = document.getElementById('productDetailWrap');
  const notFound = document.getElementById('productNotFound');
  const p = Products.byId(id);
  if (!p) {
    wrap.style.display = 'none';
    notFound.style.display = 'block';
    return;
  }
  document.title = p.name + ' � CJ Hubs Store';
  PD_STATE = { selectedVariants: {}, qty: 1, activeImage: 0 };
  const variants = Array.isArray(p.variants) ? p.variants : []; variants.forEach(v => { const options = Array.isArray(v && v.options) ? v.options : []; const first = options.find(o => o && o.label != null); if (v && v.name && first) PD_STATE.selectedVariants[v.name] = first.label; });

  document.getElementById('pdCategory').textContent = CATEGORIES.find(c=>c.id===p.category)?.name || '';
  document.getElementById('pdCategory').href = p.category === 'gift-ideas' ? 'gift-ideas.html' : 'products-accessories.html';
  document.getElementById('pdTitle').textContent = p.name;
  document.getElementById('crumbTitle').textContent = p.name;
  document.getElementById('pdDesc').textContent = p.description;
  document.getElementById('pdSku').textContent = p.sku;
  document.getElementById('pdStockCount').textContent = p.stock;

  renderPDPrice(p);
  renderPDGallery(p);
  renderPDVariants(p);
  renderPDStock(p);

  document.getElementById('qtyInput').value = 1;
  document.getElementById('qtyMinus').onclick = () => stepQty(-1, p);
  document.getElementById('qtyPlus').onclick = () => stepQty(1, p);
  document.getElementById('qtyInput').oninput = (e) => {
    let v = Math.max(1, Math.min(p.stock, parseInt(e.target.value)||1));
    PD_STATE.qty = v; e.target.value = v;
  };
  document.getElementById('addToCartBtn').onclick = () => addFromDetail(p, false);
  document.getElementById('buyNowBtn').onclick = () => addFromDetail(p, true);

  if (p.stock <= 0) {
    document.getElementById('addToCartBtn').disabled = true;
    document.getElementById('buyNowBtn').disabled = true;
  }

  const relatedEl = document.getElementById('relatedGrid');
  const related = Products.related(p);
  relatedEl.innerHTML = related.length ? related.map(productCardHTML).join('') : '';
  document.getElementById('relatedSection').style.display = related.length ? 'block' : 'none';
}

function renderPDPrice(p) {
  const el = document.getElementById('pdPrice');
  const off = p.salePrice ? Math.round((1-p.salePrice/p.price)*100) : 0;
  el.innerHTML = `
    <span class="now">${formatPrice(p.salePrice ?? p.price)}</span>
    ${p.salePrice ? `<span class="was">${formatPrice(p.price)}</span><span class="off">Save ${off}%</span>` : ''}
  `;
}

function renderPDGallery(p) {
  const images = Array.isArray(p?.images) && p.images.length ? p.images : [buildPlaceholderImage(700, 700)];
  const activeIndex = Math.min(PD_STATE.activeImage, images.length - 1);
  PD_STATE.activeImage = Math.max(0, activeIndex);
  const mainImg = document.getElementById("pdMainImg");
  mainImg.src = productImageSrc(p, PD_STATE.activeImage, 700, 700);
  mainImg.alt = p.name;
  mainImg.onerror = () => handleImageError(mainImg, 700, 700);
  document.getElementById("pdThumbs").innerHTML = images.map((img,i) =>
    `<img src="${firstValidImage(img) || buildPlaceholderImage(100,100)}" class="${i===PD_STATE.activeImage?"active":""}" alt="${p.name} thumbnail ${i+1}" loading="lazy" onclick="setPDImage(${i})" onerror="handleImageError(this,100,100)">`).join("");
}
function setPDImage(i) {
  PD_STATE.activeImage = i;
  const p = Products.byId(getQueryParam('id'));
  renderPDGallery(p);
}

function renderPDVariants(p) {
  const el = document.getElementById('pdVariants');
  const variants = Array.isArray(p?.variants) ? p.variants : [];
  if (!variants.length) { el.innerHTML = ''; return; }
  el.innerHTML = variants.map(v => `
    <div class="variant-block">
      <h5>${v.name}: <span style="color:var(--gold-dark);">${PD_STATE.selectedVariants[v.name]}</span></h5>
      <div class="variant-opts">
        ${v.options.map(o => v.type === 'swatch' ?
          `<span class="swatch ${PD_STATE.selectedVariants[v.name]===o.label?'selected':''}" style="background:${o.value}" title="${o.label}" onclick="selectVariant('${v.name}','${o.label}')"></span>` :
          `<span class="variant-opt ${PD_STATE.selectedVariants[v.name]===o.label?'selected':''}" onclick="selectVariant('${v.name}','${o.label}')">${o.label}</span>`
        ).join('')}
      </div>
    </div>`).join('');
}
function selectVariant(name, label) {
  PD_STATE.selectedVariants[name] = label;
  const p = Products.byId(getQueryParam('id'));
  renderPDVariants(p);
}

function renderPDStock(p) {
  const el = document.getElementById('pdStockMsg');
  if (p.stock <= 0) el.innerHTML = `<span class="pd-stock-msg out">Out of Stock</span>`;
  else if (p.stock <= 5) el.innerHTML = `<span class="pd-stock-msg">Only ${p.stock} left in stock</span>`;
  else el.innerHTML = `<span class="pd-stock-msg">In Stock</span>`;
}

function stepQty(delta, p) {
  const input = document.getElementById('qtyInput');
  let v = Math.max(1, Math.min(p.stock, (parseInt(input.value)||1) + delta));
  input.value = v; PD_STATE.qty = v;
}

function addFromDetail(p, buyNow) {
  if (p.stock <= 0) return;
  const variantStr = Object.entries(PD_STATE.selectedVariants).map(([k,v])=>`${k}: ${v}`).join(', ');
  Cart.add(p.id, variantStr || null, PD_STATE.qty);
  updateCartCount();
  showToast(`${p.name} added to cart`);
  if (buyNow) window.location.href = 'checkout.html';
}

/* ---------- cart page ---------- */
function initCartPage() {
  renderCartPage();
}
function renderCartPage() {
  const items = Cart.detailed();
  const wrap = document.getElementById('cartWrap');
  const empty = document.getElementById('cartEmpty');
  if (!items.length) {
    wrap.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  wrap.style.display = 'grid';
  empty.style.display = 'none';

  document.getElementById('cartItemsBody').innerHTML = items.map(i => `
    <tr>
      <td>
        <div class="cart-item-info">
          <img src="${productImageSrc(i.product, 0, 100, 100)}" alt="${i.product.name}" onerror="handleImageError(this,100,100)">
          <div>
            <div class="ci-name">${i.product.name}</div>
            ${i.variant ? `<div class="ci-variant">${i.variant}</div>` : ''}
            <a class="remove-item" href="#" onclick="removeCartItem(event,'${i.productId}','${i.variant||''}')">Remove</a>
          </div>
        </div>
      </td>
      <td>${formatPrice(i.unitPrice)}</td>
      <td>
        <div class="qty-selector">
          <button onclick="changeCartQty('${i.productId}','${i.variant||''}',-1)">&minus;</button>
          <input value="${i.qty}" readonly>
          <button onclick="changeCartQty('${i.productId}','${i.variant||''}',1)">&plus;</button>
        </div>
      </td>
      <td><strong>${formatPrice(i.lineTotal)}</strong></td>
    </tr>`).join('');

  const subtotal = Cart.subtotal();
  const discount = Cart.discount();
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 6.99;
  document.getElementById('sumSubtotal').textContent = formatPrice(subtotal + discount);
  document.getElementById('sumDiscount').textContent = '-' + formatPrice(discount);
  document.getElementById('sumShipping').textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
  document.getElementById('sumTotal').textContent = formatPrice(subtotal + shipping);
  updateCartCount();
}
function removeCartItem(e, id, variant) {
  e.preventDefault();
  Cart.remove(id, variant || null);
  renderCartPage();
  showToast('Item removed from cart');
}
function changeCartQty(id, variant, delta) {
  const items = Cart.items();
  const key = id + '|' + variant;
  const item = items.find(i => (i.productId+'|'+(i.variant||'')) === key);
  if (!item) return;
  const product = Products.byId(id);
  const newQty = item.qty + delta;
  if (newQty > product.stock) { showToast('No more stock available'); return; }
  Cart.updateQty(id, variant || null, newQty);
  renderCartPage();
}

/* ---------- checkout page ---------- */
function initCheckoutPage() {
  const items = Cart.detailed();
  const empty = document.getElementById('checkoutEmpty');
  const wrap = document.getElementById('checkoutWrap');
  if (!items.length) { wrap.style.display='none'; empty.style.display='block'; return; }
  wrap.style.display = 'grid'; empty.style.display = 'none';

  const user = Auth.currentUser();
  if (user) {
    document.getElementById('coFullName').value = user.name || '';
    document.getElementById('coEmail').value = user.email || '';
    document.getElementById('coPhone').value = user.phone || '';
    if (user.address) {
      document.getElementById('coAddress').value = user.address.line1 || '';
      document.getElementById('coCity').value = user.address.city || '';
      document.getElementById('coState').value = user.address.state || '';
      document.getElementById('coCountry').value = user.address.country || '';
      document.getElementById('coPostal').value = user.address.postal || '';
    }
  }

  document.getElementById('coItemsSummary').innerHTML = items.map(i => `
    <div class="summary-row"><span>${i.product.name} × ${i.qty}${i.variant ? ' ('+i.variant+')' : ''}</span><span>${formatPrice(i.lineTotal)}</span></div>
  `).join('');
  const subtotal = Cart.subtotal();
  const discount = Cart.discount();
  const shipping = subtotal >= 75 ? 0 : 6.99;
  document.getElementById('coSubtotal').textContent = formatPrice(subtotal+discount);
  document.getElementById('coDiscount').textContent = '-' + formatPrice(discount);
  document.getElementById('coShipping').textContent = shipping===0 ? 'Free' : formatPrice(shipping);
  document.getElementById('coTotal').textContent = formatPrice(subtotal+shipping);

  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    submitOrder(items, subtotal, discount, shipping);
  });
}

function fieldRequired(id) {
  const el = document.getElementById(id);
  const group = el.closest('.form-group');
  if (!el.value.trim()) { group.classList.add('invalid'); return false; }
  group.classList.remove('invalid');
  return true;
}

function submitOrder(items, subtotal, discount, shipping) {
  const requiredFields = ['coFullName','coEmail','coPhone','coAddress','coCity','coState','coCountry'];
  let valid = true;
  requiredFields.forEach(id => { if (!fieldRequired(id)) valid = false; });
  const email = document.getElementById('coEmail').value;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    document.getElementById('coEmail').closest('.form-group').classList.add('invalid');
    valid = false;
  }
  // re-validate stock server-side-style check
  for (const i of items) {
    const fresh = Products.byId(i.productId);
    if (!fresh || fresh.stock < i.qty) {
      showToast(`Sorry, "${i.product.name}" no longer has enough stock.`);
      valid = false;
    }
  }
  if (!valid) { showToast('Please fix the highlighted fields'); return; }

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Processing payment...`;

  setTimeout(() => {
    // deduct stock
    items.forEach(i => {
      const fresh = Products.byId(i.productId);
      fresh.stock = Math.max(0, fresh.stock - i.qty);
      Products.save(fresh);
    });

    const user = Auth.currentUser();
    const order = {
      id: 'o' + Date.now(),
      orderNumber: Orders.newOrderNumber(),
      userId: user ? user.id : null,
      customer: {
        name: document.getElementById('coFullName').value,
        email: document.getElementById('coEmail').value,
        phone: document.getElementById('coPhone').value
      },
      shipping: {
        address: document.getElementById('coAddress').value,
        city: document.getElementById('coCity').value,
        state: document.getElementById('coState').value,
        country: document.getElementById('coCountry').value,
        postal: document.getElementById('coPostal').value
      },
      items: items.map(i => ({
        productId: i.productId, name: i.product.name, image: (Array.isArray(i.product.images) && typeof i.product.images[0] === "string" && i.product.images[0]) || '',
        variant: i.variant, qty: i.qty, price: i.unitPrice
      })),
      subtotal: subtotal + discount,
      discount, shipping,
      total: subtotal + shipping,
      paymentStatus: 'Paid',
      status: 'Processing',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    Orders.create(order);
    Cart.clear();
    window.location.href = 'order-success.html?order=' + order.id;
  }, 1400);
}

/* ---------- account page ---------- */
function initAccountPage() {
  const user = Auth.currentUser();
  if (!user) { window.location.href = 'login.html?redirect=account.html'; return; }
  document.getElementById('accName').textContent = user.name;
  document.getElementById('accEmail').textContent = user.email;
  document.getElementById('profileName').value = user.name || '';
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profilePhone').value = user.phone || '';
  if (user.address) {
    document.getElementById('profileAddress').value = user.address.line1 || '';
    document.getElementById('profileCity').value = user.address.city || '';
    document.getElementById('profileCountry').value = user.address.country || '';
  }

  // populate read-only view
  const setView = () => {
    document.getElementById('viewName').textContent = user.name || '';
    document.getElementById('viewEmail').textContent = user.email || '';
    document.getElementById('viewPhone').textContent = user.phone ? ('Phone: ' + user.phone) : '';
    const addr = user.address ? [user.address.line1, user.address.city, user.address.country].filter(Boolean).join(', ') : '';
    document.getElementById('viewAddress').textContent = addr;
  };
  setView();

  // toggle edit/view
  const editBtn = document.getElementById('editProfileBtn');
  const cancelBtn = document.getElementById('cancelEditProfile');
  const profileCard = document.getElementById('profileCard');
  const profileForm = document.getElementById('profileForm');
  if (editBtn) editBtn.addEventListener('click', () => { profileCard.style.display = 'none'; profileForm.style.display = 'block'; });
  if (cancelBtn) cancelBtn.addEventListener('click', () => { profileForm.style.display = 'none'; profileCard.style.display = 'block'; });

  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    Auth.updateUser(user.id, {
      name: document.getElementById('profileName').value,
      phone: document.getElementById('profilePhone').value,
      address: {
        line1: document.getElementById('profileAddress').value,
        city: document.getElementById('profileCity').value,
        country: document.getElementById('profileCountry').value
      }
    });
    showToast('Profile updated successfully');
    // reflect changes in UI
    user.name = document.getElementById('profileName').value;
    user.phone = document.getElementById('profilePhone').value;
    user.address = { line1: document.getElementById('profileAddress').value, city: document.getElementById('profileCity').value, country: document.getElementById('profileCountry').value };
    document.getElementById('accName').textContent = user.name;
    setView();
    profileForm.style.display = 'none'; profileCard.style.display = 'block';
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'index.html';
  });

  const orders = Orders.byUser(user.id);
  const ordersEl = document.getElementById('ordersList');
  if (!orders.length) {
    ordersEl.innerHTML = emptyStateHTML('??', "You haven't placed any orders yet", 'Start exploring our collection.', 'shop.html', 'Start Shopping');
  } else {
    ordersEl.innerHTML = orders.map(o => `
      <div class="admin-panel" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <strong>${o.orderNumber}</strong>
            <div style="font-size:12.5px;color:var(--gray-600);">${new Date(o.createdAt).toLocaleDateString()} � ${o.items.length} item(s)</div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;">
            <span class="badge ${o.status.toLowerCase()}">${o.status}</span>
            <strong>${formatPrice(o.total)}</strong>
          </div>
        </div>
      </div>`).join('');
  }
}

/* ---------- login / register ---------- */
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const res = Auth.login(email, password);
    const err = document.getElementById('loginError');
    if (!res.ok) { err.textContent = res.error; err.style.display = 'block'; return; }
    const redirect = Auth.isAdminUser(res.user) ? 'admin/dashboard.html' : (getQueryParam('redirect') || 'account.html');
    window.location.href = redirect;
  });
}
function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const err = document.getElementById('registerError');
    if (password.length < 6) { err.textContent = 'Password must be at least 6 characters.'; err.style.display='block'; return; }
    const res = Auth.register(name, email, password);
    if (!res.ok) { err.textContent = res.error; err.style.display = 'block'; return; }
    window.location.href = 'account.html';
  });
}

/* ---------- order success ---------- */
function initOrderSuccessPage() {
  const id = getQueryParam('order');
  const order = Orders.byId(id);
  const wrap = document.getElementById('successWrap');
  if (!order) { wrap.innerHTML = emptyStateHTML('❌','Order not found','We could not locate that order.', 'shop.html', 'Continue Shopping'); return; }
  document.getElementById('successOrderNum').textContent = order.orderNumber;
  document.getElementById('successTotal').textContent = formatPrice(order.total);
  document.getElementById('successEmail').textContent = order.customer.email;
}

/* ---------- contact page ---------- */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast("Message sent � we'll get back to you within 24 hours.");
    form.reset();
  });
}








