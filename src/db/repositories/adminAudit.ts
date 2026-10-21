import { getDb } from '../connection.js';

export interface AuditLog {
  id: number;
  admin_id: number;
  action: string;
  target_telegram_id: number | null;
  details: string | null;
  created_at: string;
}

export function logAdminAction(
  adminId: number,
  action: string,
  targetTelegramId?: number | null,
  details?: string,
): void {
  getDb()
    .prepare(`
      INSERT INTO admin_audit_log (admin_id, action, target_telegram_id, details)
      VALUES (?, ?, ?, ?)
    `)
    .run(adminId, action, targetTelegramId ?? null, details ?? null);
}

export function getRecentAuditLogs(limit = 20): AuditLog[] {
  return getDb()
    .prepare(`
      SELECT * FROM admin_audit_log
      ORDER BY created_at DESC
      LIMIT ${limit}
    `)
    .all() as AuditLog[];
}
