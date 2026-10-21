import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../connection.js';

export interface Order {
  id: string;
  telegram_id: number;
  product_id: string;
  amount_kopecks: number;
  currency: string;
  status: 'pending' | 'paid' | 'canceled' | 'refunded';
  created_at: string;
  updated_at: string;
}

export function createOrder(telegramId: number, amountKopecks: number): Order {
  const id = uuidv4();
  const db = getDb();
  db.prepare(`
    INSERT INTO orders (id, telegram_id, amount_kopecks)
    VALUES (?, ?, ?)
  `).run(id, telegramId, amountKopecks);
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order;
}

export function getOrderById(id: string): Order | undefined {
  return getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
}

export function updateOrderStatus(id: string, status: Order['status']): void {
  getDb()
    .prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, id);
}

export function countPaidOrders(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as cnt FROM orders WHERE status = 'paid'")
    .get() as { cnt: number };
  return row.cnt;
}

export function sumRevenue(): number {
  const row = getDb()
    .prepare("SELECT SUM(amount_kopecks) as total FROM orders WHERE status = 'paid'")
    .get() as { total: number | null };
  return row.total ?? 0;
}
