require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

const twilioClient = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Helper to broadcast changes
const broadcastUpdate = (shopId) => {
  io.emit('queue-update', { shopId });
};

// --- API ENDPOINTS ---

// Get shop info
app.get('/api/shops/:slug', (req, res) => {
  const shop = db.prepare('SELECT * FROM shops WHERE slug = ?').get(req.params.slug);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  res.json(shop);
});

// Get today's tickets
app.get('/api/tickets/:shopId', (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tickets = db.prepare('SELECT * FROM tickets WHERE shop_id = ? AND arrived_at >= ? ORDER BY num ASC')
    .all(req.params.shopId, today.toISOString());
  res.json(tickets);
});

// Get barbers
app.get('/api/barbers/:shopId', (req, res) => {
  const barbers = db.prepare('SELECT * FROM barbers WHERE shop_id = ? ORDER BY name ASC')
    .all(req.params.shopId);
  res.json(barbers);
});

// Join queue
app.post('/api/tickets', (req, res) => {
  const { shopId, name, phone, service } = req.body;
  const id = 't_' + Date.now();
  
  // Get next number for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastTicket = db.prepare('SELECT MAX(num) as max_num FROM tickets WHERE shop_id = ? AND arrived_at >= ?')
    .get(shopId, today.toISOString());
  const num = (lastTicket?.max_num || 0) + 1;

  db.prepare('INSERT INTO tickets (id, shop_id, num, name, phone, service) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, shopId, num, name, phone, service);
  
  broadcastUpdate(shopId);
  res.json({ id, num });
});

// Update ticket status (Call, Serve, Skip)
app.patch('/api/tickets/:id', async (req, res) => {
  const { status, barberId } = req.body;
  const now = new Date().toISOString();
  
  let query = 'UPDATE tickets SET status = ?';
  const params = [status];

  if (status === 'called') {
    query += ', called_at = ?';
    params.push(now);
  } else if (status === 'served' || status === 'skipped') {
    query += ', served_at = ?';
    params.push(now);
  }
  
  if (barberId) {
    query += ', barber_id = ?';
    params.push(barberId);
  }

  query += ' WHERE id = ?';
  params.push(req.params.id);

  db.prepare(query).run(...params);

  // Send SMS if called
  if (status === 'called' && twilioClient) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    if (ticket?.phone) {
      try {
        await twilioClient.messages.create({
          body: `Bonjour ${ticket.name} ! C'est à votre tour chez H Barber. Nous vous attendons !`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: ticket.phone
        });
      } catch (e) {
        console.error('Twilio error:', e);
      }
    }
  }

  const ticket = db.prepare('SELECT shop_id FROM tickets WHERE id = ?').get(req.params.id);
  broadcastUpdate(ticket.shop_id);
  res.json({ success: true });
});

// Update barber status or name
app.patch('/api/barbers/:id', (req, res) => {
  const { is_active, name } = req.body;
  if (is_active !== undefined) {
    db.prepare('UPDATE barbers SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
  }
  if (name !== undefined) {
    db.prepare('UPDATE barbers SET name = ? WHERE id = ?').run(name, req.params.id);
  }
  
  const barber = db.prepare('SELECT shop_id FROM barbers WHERE id = ?').get(req.params.id);
  broadcastUpdate(barber.shop_id);
  res.json({ success: true });
});

// Delete barber
app.delete('/api/barbers/:id', (req, res) => {
  const barber = db.prepare('SELECT shop_id FROM barbers WHERE id = ?').get(req.params.id);
  db.prepare('DELETE FROM barbers WHERE id = ?').run(req.params.id);
  broadcastUpdate(barber.shop_id);
  res.json({ success: true });
});

// Add barber
app.post('/api/barbers', (req, res) => {
  const { shopId, name } = req.body;
  const id = 'b_' + Date.now();
  db.prepare('INSERT INTO barbers (id, shop_id, name, is_active) VALUES (?, ?, ?, 1)').run(id, shopId, name);
  broadcastUpdate(shopId);
  res.json({ id });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`H Barber Backend running on port ${PORT}`);
});
