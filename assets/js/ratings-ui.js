(function () {
  const STYLE_ID = 'cjhubs-ratings-ui'

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      .rating-box {
        margin-top: 24px;
        padding: 18px 20px;
        border: 1px solid var(--gray-200);
        border-radius: 18px;
        background: linear-gradient(180deg, #fff 0%, #fafbff 100%);
        box-shadow: var(--shadow-soft);
      }
      .rating-box .title {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        color: var(--navy);
        margin: 0 0 8px;
      }
      .rating-box .stars {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .rating-box button {
        width: 42px;
        height: 42px;
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        background: #fff;
        color: var(--gray-400);
        font-size: 20px;
        cursor: pointer;
      }
      .rating-box button.on {
        background: linear-gradient(135deg, var(--gold-light), var(--gold-dark));
        color: var(--navy);
        border-color: transparent;
      }
      .rating-box p {
        margin: 10px 0 0;
        font-size: 13px;
        color: var(--gray-600);
      }
    `
    document.head.appendChild(style)
  }

  function mount() {
    ensureStyles()
    const section = document.getElementById('commentSection')
    if (!section || document.getElementById('ratingBox')) return

    const box = document.createElement('div')
    box.id = 'ratingBox'
    box.className = 'rating-box'
    box.innerHTML = `
      <div class="title">Rate this product</div>
      <div class="stars">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-rating="${n}">&#9733;</button>`).join('')}
      </div>
      <p>Stars are now visible on the product page.</p>
    `

    section.parentNode.insertBefore(box, section)
    box.onclick = (event) => {
      const button = event.target.closest('button[data-rating]')
      if (!button) return
      const rating = Number(button.dataset.rating)
      box.querySelectorAll('button').forEach((item) => {
        item.classList.toggle('on', Number(item.dataset.rating) <= rating)
      })
      showToast(`Selected ${rating} star${rating === 1 ? '' : 's'}`)
    }
  }

  const originalInitProductPage = window.initProductPage
  window.initProductPage = function () {
    if (typeof originalInitProductPage === 'function') originalInitProductPage()
    const id = new URLSearchParams(location.search).get('id')
    const product = typeof Products !== 'undefined' && Products && typeof Products.byId === 'function' ? Products.byId(id) : null
    if (product) mount()
  }
})()
