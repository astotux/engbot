import os from 'os';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import type { BotContext } from '../src/bot/context.js';
import type { LessonStep } from '../src/content/course.js';
import {
  sendStepMedia,
  stepHasMedia,
  getMp4Dimensions,
  getMp4Duration,
} from '../src/bot/handlers/lessonHandler.js';

describe('sendStepMedia', () => {
  let mockCtx: Partial<BotContext>;
  let replyWithVoiceMock: ReturnType<typeof vi.fn>;
  let replyWithVideoNoteMock: ReturnType<typeof vi.fn>;

  const tempDir = path.join(os.tmpdir(), 'engbot_test_media_' + Date.now());
  const tempMp3 = path.join(tempDir, 'sample.mp3');
  const tempMp4 = path.join(tempDir, 'sample.mp4');

  beforeEach(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(tempMp3, 'dummy mp3 content');
    fs.writeFileSync(tempMp4, 'dummy mp4 content');

    replyWithVoiceMock = vi.fn().mockResolvedValue({ message_id: 201 });
    replyWithVideoNoteMock = vi.fn().mockResolvedValue({ message_id: 202 });

    mockCtx = {
      session: { cleanupMessageIds: [] } as any,
      replyWithVoice: replyWithVoiceMock,
      replyWithVideoNote: replyWithVideoNoteMock,
    } as unknown as BotContext;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('отправляет .mp3 как голосовое сообщение (replyWithVoice)', async () => {
    const step: LessonStep = {
      type: 'choice',
      question: 'Test question',
      audioFile: tempMp3,
      options: ['A', 'B'],
      correctIndex: 0,
      hint: '',
      explanation: '',
    };

    await sendStepMedia(mockCtx as BotContext, step);

    expect(replyWithVoiceMock).toHaveBeenCalledTimes(1);
    expect(replyWithVideoNoteMock).not.toHaveBeenCalled();
    expect(mockCtx.session?.cleanupMessageIds).toContain(201);
  });

  it('отправляет .mp4 как видео-кружок (replyWithVideoNote) с опцией length', async () => {
    const step: LessonStep = {
      type: 'explain',
      title: 'Intro',
      text: 'Lesson intro',
      audioFile: tempMp4,
    };

    await sendStepMedia(mockCtx as BotContext, step);

    expect(replyWithVideoNoteMock).toHaveBeenCalledTimes(1);
    expect(replyWithVoiceMock).not.toHaveBeenCalled();
    expect(replyWithVideoNoteMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ length: 640 }));
    expect(mockCtx.session?.cleanupMessageIds).toContain(202);
  });

  it('поддерживает явные поля voiceFile и videoNoteFile', async () => {
    const step: LessonStep = {
      type: 'input',
      question: 'Input something',
      voiceFile: tempMp3,
      videoNoteFile: tempMp4,
      answerKey: ['yes'],
      hint: '',
      explanation: '',
    };

    await sendStepMedia(mockCtx as BotContext, step);

    expect(replyWithVoiceMock).toHaveBeenCalledTimes(1);
    expect(replyWithVideoNoteMock).toHaveBeenCalledTimes(1);
  });

  it('дедуплицирует одинаковый путь, если он указан в разных полях', async () => {
    const step: LessonStep = {
      type: 'explain',
      title: 'Test',
      text: 'Test',
      audioFile: tempMp3,
      voiceFile: tempMp3,
    };

    await sendStepMedia(mockCtx as BotContext, step);

    expect(replyWithVoiceMock).toHaveBeenCalledTimes(1);
  });

  it('пропускает несуществующие файлы без ошибок', async () => {
    const step: LessonStep = {
      type: 'choice',
      question: 'Missing file',
      audioFile: 'assets/audio/non_existent_file_12345.mp3',
      options: ['1', '2'],
      correctIndex: 0,
      hint: '',
      explanation: '',
    };

    await expect(sendStepMedia(mockCtx as BotContext, step)).resolves.not.toThrow();
    expect(replyWithVoiceMock).not.toHaveBeenCalled();
    expect(replyWithVideoNoteMock).not.toHaveBeenCalled();
  });

  it('автоматически фоллбечит расширение .mp4 на существующий .mp3', async () => {
    const fallbackPath = path.join(tempDir, 'voice_only.mp4');
    const actualMp3 = path.join(tempDir, 'voice_only.mp3');
    fs.writeFileSync(actualMp3, 'dummy mp3 data');

    const step: LessonStep = {
      type: 'explain',
      title: 'Fallback test',
      text: 'Text',
      audioFile: fallbackPath,
    };

    await sendStepMedia(mockCtx as BotContext, step);

    expect(replyWithVoiceMock).toHaveBeenCalledTimes(1);
    expect(replyWithVideoNoteMock).not.toHaveBeenCalled();
  });

  it('stepHasMedia возвращает true если есть медиафайл и false если его нет', () => {
    expect(stepHasMedia({
      type: 'explain',
      title: 'No media',
      text: 'Text',
    })).toBe(false);

    expect(stepHasMedia({
      type: 'explain',
      title: 'With media',
      text: 'Text',
      voiceFile: tempMp3,
    })).toBe(true);
  });

  it('getMp4Dimensions и getMp4Duration корректно считывают реальный видео-кружок intro', () => {
    const introPath = 'assets/audio/day01_s01_intro.mp4';
    if (fs.existsSync(introPath)) {
      const dims = getMp4Dimensions(introPath);
      expect(dims).not.toBeNull();
      expect(dims?.width).toBe(dims?.height); // Строго квадратный 1:1
      expect(dims?.width).toBe(640);

      const duration = getMp4Duration(introPath);
      expect(duration).toBeGreaterThan(0);
      expect(Math.round(duration!)).toBe(10);
    }
  });
});
