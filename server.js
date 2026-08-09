const http = require("http");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const root = __dirname;
const envFile = path.join(root, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  }
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const COLLECTIONS = {
  products: "cjhubs_products",
  users: "cjhubs_users",
  orders: "cjhubs_orders",
  admin: "cjhubs_admin"
};
const DEFAULTS = {
  [COLLECTIONS.products]: [],
  [COLLECTIONS.users]: [],
  [COLLECTIONS.orders]: [],
  [COLLECTIONS.admin]: { username: "admin", password: Buffer.from("admin123").toString("base64"), name: "Store Admin" }
};
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function typeOf(file) {
  return TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
}
function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve(null);
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
  });
}

async function initDb() {
  await pool.query("create table if not exists cjh_store (collection text primary key, payload jsonb not null, updated_at timestamptz not null default now())");
  for (const [collection, payload] of Object.entries(DEFAULTS)) {
    await pool.query("insert into cjh_store (collection, payload) values ($1, $2::jsonb) on conflict (collection) do nothing", [collection, JSON.stringify(payload)]);
  }
}
async function readState() {
  const state = JSON.parse(JSON.stringify(DEFAULTS));
  const rows = await pool.query("select collection, payload from cjh_store");
  for (const row of rows.rows) state[row.collection] = row.payload;
  return state;
}
async function writeState(collection, value) {
  if (!Object.prototype.hasOwnProperty.call(DEFAULTS, collection)) return null;
  const payload = value === null || value === undefined ? DEFAULTS[collection] : value;
  await pool.query("insert into cjh_store (collection, payload) values ($1, $2::jsonb) on conflict (collection) do update set payload = excluded.payload, updated_at = now()", [collection, JSON.stringify(payload)]);
  return payload;
}
function injectProxy(html) {
  return html.replace(/<script src="((?:\.\.\/)?assets\/js\/data\.js)"><\/script>/g, function (match, src) {
    return '<script src="/db-proxy.js"></script>\n<script src="' + src + '"></script>';
  });
}

const server = http.createServer(async (req, res) => {
  const allowedOrigin = "https://cjhubs.netlify.app";

res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
res.setHeader("Access-Control-Allow-Credentials", "true");

if (req.method === "OPTIONS") {
  res.writeHead(204);
  res.end();
  return;
}
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/health") {
      await pool.query("select 1");
      return send(res, 200, { ok: true, database: "connected" });
    }
    if (url.pathname === "/api/bootstrap") {
      return send(res, 200, { ok: true, collections: await readState() });
    }
    if (url.pathname === "/api/state" && req.method === "PUT") {
      const body = await readBody(req);
      if (!body || !body.collection) return send(res, 400, { ok: false, error: "collection is required" });
      const payload = await writeState(body.collection, body.value);
      if (payload === null) return send(res, 400, { ok: false, error: "unknown collection" });
      return send(res, 200, { ok: true, collection: body.collection });
    }
    if (url.pathname.startsWith("/api/")) return send(res, 404, { ok: false, error: "Not found" });

    let rel = url.pathname === "/" ? "/index.html" : url.pathname;
    let file = path.normalize(path.join(root, decodeURIComponent(rel)));
    if (!file.startsWith(root)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) && !path.extname(file)) {
      const alt = file + ".html";
      if (fs.existsSync(alt)) file = alt;
    }
    if (!fs.existsSync(file)) return send(res, 404, "Not found", "text/plain; charset=utf-8");

    if (path.extname(file).toLowerCase() === ".html") {
      return send(res, 200, injectProxy(fs.readFileSync(file, "utf8")), "text/html; charset=utf-8");
    }
    return send(res, 200, fs.readFileSync(file), typeOf(file));
  } catch (error) {
    console.error(error);
    return send(res, 500, { ok: false, error: "Internal server error" });
  }
});

initDb().then(() => {
  const port = Number(process.env.PORT || 3000);
  server.listen(port, () => console.log("CJ Hubs Store running on http://localhost:" + port));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
