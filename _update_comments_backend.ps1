$ErrorActionPreference = 'Stop'

function Update-File {
  param(
    [string]$Path,
    [string]$Find,
    [string]$Replace
  )
  $content = Get-Content -LiteralPath $Path -Raw
  if (-not $content.Contains($Find)) {
    throw "Pattern not found in ${Path}: $Find"
  }
  $content = $content.Replace($Find, $Replace)
  Set-Content -LiteralPath $Path -Value $content
}

Update-File 'assets/js/data.js' @"
  PRODUCTS: 'cjhubs_products',
  CART: 'cjhubs_cart',
  USERS: 'cjhubs_users',
  CURRENT_USER: 'cjhubs_current_user',
  ORDERS: 'cjhubs_orders',
  ADMIN: 'cjhubs_admin',
"@ @"
  PRODUCTS: 'cjhubs_products',
  CART: 'cjhubs_cart',
  USERS: 'cjhubs_users',
  CURRENT_USER: 'cjhubs_current_user',
  ORDERS: 'cjhubs_orders',
  COMMENTS: 'cjhubs_comments',
  ADMIN: 'cjhubs_admin',
"@

Update-File 'assets/js/data.js' @"
const REMOTE_DB_KEYS = new Set([DB_KEYS.PRODUCTS, DB_KEYS.USERS, DB_KEYS.ORDERS, DB_KEYS.ADMIN]);
"@ @"
const REMOTE_DB_KEYS = new Set([DB_KEYS.PRODUCTS, DB_KEYS.USERS, DB_KEYS.ORDERS, DB_KEYS.COMMENTS, DB_KEYS.ADMIN]);
"@

Update-File 'assets/js/data.js' @"
    if (!dbGet(DB_KEYS.SEEDED, false)) {
      dbSet(DB_KEYS.PRODUCTS, SEED_PRODUCTS);
      dbSet(DB_KEYS.USERS, []);
      dbSet(DB_KEYS.ORDERS, []);
      dbSet(DB_KEYS.CART, []);
      dbSet(DB_KEYS.WISHLIST, []);
      dbSet(DB_KEYS.SEEDED, true);
    }
"@ @"
    if (!dbGet(DB_KEYS.SEEDED, false)) {
      dbSet(DB_KEYS.PRODUCTS, SEED_PRODUCTS);
      dbSet(DB_KEYS.USERS, []);
      dbSet(DB_KEYS.ORDERS, []);
      dbSet(DB_KEYS.COMMENTS, []);
      dbSet(DB_KEYS.CART, []);
      dbSet(DB_KEYS.WISHLIST, []);
      dbSet(DB_KEYS.SEEDED, true);
    }
"@

Update-File 'assets/js/data.js' @"
  if (!dbGet(DB_KEYS.PRODUCTS)) dbSet(DB_KEYS.PRODUCTS, SEED_PRODUCTS);
"@ @"
  if (!dbGet(DB_KEYS.PRODUCTS)) dbSet(DB_KEYS.PRODUCTS, SEED_PRODUCTS);
  if (!dbGet(DB_KEYS.COMMENTS)) dbSet(DB_KEYS.COMMENTS, []);
"@
