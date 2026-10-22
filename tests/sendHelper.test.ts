import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BotContext } from '../src/bot/context.js';
import {
  sendScreen,
  editScreen,
  addCleanupMessage,
  cleanupAuxiliaryMessages,
  deleteUserMessage,
} from '../src/bot/sendHelper.js';

describe('sendHelper - single-message concept & cleanup', () => {
  let mockCtx: Partial<BotContext>;
  let editMessageTextMock: ReturnType<typeof vi.fn>;
  let replyMock: ReturnType<typeof vi.fn>;
  let deleteMessageMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    editMessageTextMock = vi.fn().mockResolvedValue({});
    replyMock = vi.fn().mockResolvedValue({ message_id: 100 });
    deleteMessageMock = vi.fn().mockResolvedValue(true);

    mockCtx = {
      chat: { id: 12345, type: 'private' },
      session: {
        lastBotMessageId: undefined,
        cleanupMessageIds: [],
      },
      api: {
        editMessageText: editMessageTextMock,
        deleteMessage: deleteMessageMock,
      } as any,
      reply: replyMock as any,
      editMessageText: editMessageTextMock as any,
    } as unknown as BotContext;
  });

  it('sendScreen отправляет новое сообщение, если ещё нет lastBotMessageId', async () => {
    await sendScreen(mockCtx as BotContext, 'Привет');

    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(mockCtx.session?.lastBotMessageId).toBe(100);
    expect(editMessageTextMock).not.toHaveBeenCalled();
  });

  it('sendScreen редактирует существующее сообщение, если lastBotMessageId уже задан', async () => {
    mockCtx.session!.lastBotMessageId = 100;

    await sendScreen(mockCtx as BotContext, 'Обновлённый текст');

    expect(editMessageTextMock).toHaveBeenCalledWith(12345, 100, 'Обновлённый текст', expect.anything());
    expect(replyMock).not.toHaveBeenCalled();
    expect(mockCtx.session?.lastBotMessageId).toBe(100);
  });

  it('sendScreen удаляет старое и отправляет новое, если редактирование упало с ошибкой', async () => {
    mockCtx.session!.lastBotMessageId = 100;
    editMessageTextMock.mockRejectedValueOnce(new Error('message to edit not found'));
    replyMock.mockResolvedValueOnce({ message_id: 200 });

    await sendScreen(mockCtx as BotContext, 'Новый текст');

    expect(deleteMessageMock).toHaveBeenCalledWith(12345, 100);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(mockCtx.session?.lastBotMessageId).toBe(200);
  });

  it('addCleanupMessage и cleanupAuxiliaryMessages удаляют вспомогательные сообщения', async () => {
    addCleanupMessage(mockCtx as BotContext, 501);
    addCleanupMessage(mockCtx as BotContext, 502);

    expect(mockCtx.session?.cleanupMessageIds).toEqual([501, 502]);

    await cleanupAuxiliaryMessages(mockCtx as BotContext);

    expect(deleteMessageMock).toHaveBeenCalledWith(12345, 501);
    expect(deleteMessageMock).toHaveBeenCalledWith(12345, 502);
    expect(mockCtx.session?.cleanupMessageIds).toEqual([]);
  });

  it('sendScreen автоматически очищает вспомогательные сообщения перед показом экрана', async () => {
    addCleanupMessage(mockCtx as BotContext, 777);
    mockCtx.session!.lastBotMessageId = 100;

    await sendScreen(mockCtx as BotContext, 'Следующий шаг');

    expect(deleteMessageMock).toHaveBeenCalledWith(12345, 777);
    expect(editMessageTextMock).toHaveBeenCalledWith(12345, 100, 'Следующий шаг', expect.anything());
  });

  it('deleteUserMessage удаляет входящее сообщение пользователя', () => {
    mockCtx.message = { message_id: 999 } as any;

    deleteUserMessage(mockCtx as BotContext);

    expect(deleteMessageMock).toHaveBeenCalledWith(12345, 999);
  });

  it('editScreen редактирует через callbackQuery если он есть', async () => {
    mockCtx.callbackQuery = {
      message: { message_id: 300 },
    } as any;

    await editScreen(mockCtx as BotContext, 'Текст из callback');

    expect(editMessageTextMock).toHaveBeenCalled();
    expect(mockCtx.session?.lastBotMessageId).toBe(300);
  });
});
