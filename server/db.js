const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'hbarber.sqlite');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    avg_service_min INTEGER DEFAULT 15,
    is_open INTEGER DEFAULT 1,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS barbers (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id)
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    num INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    status TEXT DEFAULT 'waiting', -- waiting, called, served, skipped
    arrived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    called_at DATETIME,
    served_at DATETIME,
    barber_id TEXT,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (barber_id) REFERENCES barbers(id)
  );
`);

// Seed initial shop if not exists
const row = db.prepare('SELECT * FROM shops WHERE slug = ?').get('h-barber-mtl');
if (!row) {
  const shopId = 'shop_' + Date.now();
  db.prepare('INSERT INTO shops (id, name, slug) VALUES (?, ?, ?)').run(shopId, 'H Barber Shop', 'h-barber-mtl');
  
  // Seed barbers
  db.prepare('INSERT INTO barbers (id, shop_id, name) VALUES (?, ?, ?)').run('b1', shopId, 'Zaki');
  db.prepare('INSERT INTO barbers (id, shop_id, name) VALUES (?, ?, ?)').run('b2', shopId, 'Hamza');
}

module.exports = db;
