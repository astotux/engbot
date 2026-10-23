import type { Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { reconcilePendingPayments } from '../services/purchaseService.js';
import { processOutbox } from '../http/server.js';
import { logger } from '../utils/logger.js';

let reconciliationInterval: ReturnType<typeof setInterval> | null = null;

export function startPaymentReconciliationScheduler(
  bot: Bot<BotContext>,
  intervalMs = 10 * 60 * 1000,
): void {
  if (reconciliationInterval) return;

  const runReconciliation = async () => {
    try {
      const { checked, resolved } = await reconcilePendingPayments();
      if (resolved > 0) {
        await processOutbox(bot);
      }
      if (checked > 0) {
        logger.info({ checked, resolved }, 'Фоновая сверка платежей завершена');
      }
    } catch (err) {
      logger.error({ err }, 'Ошибка в фоновой сверке платежей');
    }
  };

  // Запуск первой сверки через 30 секунд после старта
  setTimeout(() => {
    void runReconciliation();
  }, 30_000);

  // Регулярная сверка (раз в 10 минут)
  reconciliationInterval = setInterval(() => {
    void runReconciliation();
  }, intervalMs);

  logger.info({ intervalMs }, 'Планировщик сверки платежей запущен');
}

export function stopPaymentReconciliationScheduler(): void {
  if (reconciliationInterval) {
    clearInterval(reconciliationInterval);
    reconciliationInterval = null;
    logger.info('Планировщик сверки платежей остановлен');
  }
}
