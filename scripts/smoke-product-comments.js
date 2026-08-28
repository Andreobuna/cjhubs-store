const fs = require('fs')
const vm = require('vm')

const elements = new Map()
const inserted = []
const storage = new Map()

function makeElement(id) {
  return {
    id,
    style: {},
    className: '',
    classList: {
      add() {},
      remove() {},
      toggle() { return false }
    },
    parentNode: {
      insertBefore(node, ref) {
        inserted.push({ node, ref })
      }
    },
    innerHTML: '',
    textContent: '',
    value: '',
    readOnly: false,
    disabled: false,
    src: '',
    alt: '',
    onclick: null,
    oninput: null,
    appendChild() {},
    setAttribute() {},
    querySelector() { return null },
    querySelectorAll() { return [] },
    closest() { return null }
  }
}

function register(id) {
  const el = makeElement(id)
  elements.set(id, el)
  return el
}

for (const id of [
  'productDetailWrap',
  'productNotFound',
  'pdCategory',
  'pdTitle',
  'crumbTitle',
  'pdDesc',
  'pdSku',
  'pdStockCount',
  'pdPrice',
  'pdMainImg',
  'pdThumbs',
  'pdVariants',
  'pdStockMsg',
  'qtyInput',
  'qtyMinus',
  'qtyPlus',
  'addToCartBtn',
  'buyNowBtn',
  'relatedGrid',
  'relatedSection',
  'commentSection'
]) {
  register(id)
}

elements.get('commentSection').parentNode = {
  insertBefore(node, ref) {
    inserted.push({ node, ref })
  }
}

elements.get('productDetailWrap').style.display = 'block'
elements.get('productNotFound').style.display = 'none'

const document = {
  title: '',
  head: { appendChild() {} },
  body: { appendChild() {} },
  createElement(tag) {
    return makeElement(tag)
  },
  getElementById(id) {
    if (!elements.has(id)) return null
    return elements.get(id)
  },
  querySelectorAll() {
    return []
  },
  querySelector() {
    return null
  }
}

const context = {
  console,
  document,
  location: { search: '?id=p7', origin: 'http://localhost:3000' },
  URLSearchParams,
  setTimeout,
  clearTimeout,
  btoa: (value) => Buffer.from(String(value), 'binary').toString('base64'),
  atob: (value) => Buffer.from(String(value), 'base64').toString('binary'),
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null
    },
    setItem(key, value) {
      storage.set(key, String(value))
    },
    removeItem(key) {
      storage.delete(key)
    }
  },
  __CJHUBS_DB__: {
    get(key, fallback) {
      return storage.has(key) ? JSON.parse(storage.get(key)) : fallback
    },
    set(key, value) {
      storage.set(key, JSON.stringify(value))
      return true
    },
    remove(key) {
      storage.delete(key)
      return true
    }
  },
  showToast() {},
  renderLayout() {}
}
context.window = context
context.globalThis = context
context.self = context
context.navigator = { userAgent: 'node' }

vm.createContext(context)
for (const file of ['assets/js/data.js', 'assets/js/app.js', 'assets/js/comments.js', 'assets/js/ratings-ui.js']) {
  const code = fs.readFileSync(file, 'utf8')
  vm.runInContext(code, context, { filename: file })
}

context.initProductPage()

const commentHtml = elements.get('commentSection').innerHTML || ''
const ratingInserted = inserted.some((item) => item.node && item.node.id === 'ratingBox')
const productTitle = elements.get('pdTitle').textContent || ''

if (!commentHtml.includes('comment-shell')) {
  throw new Error('Comment section was not rendered')
}
if (!ratingInserted) {
  throw new Error('Rating box was not inserted')
}
if (!productTitle) {
  throw new Error('Product detail did not render')
}

console.log(JSON.stringify({ ok: true, productTitle, commentVisible: true, ratingVisible: true }))
