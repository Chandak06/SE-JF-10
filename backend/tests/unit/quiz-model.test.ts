import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { type Connection, Types } from 'mongoose';

import { connectDatabase } from '../../src/db.js';
import {
  deleteQuizById,
  findQuizById,
  getQuizModel,
  softDeleteQuizById,
  type QuizFields
} from '../../src/models/quiz.js';

describe('Quiz model & API (CSMQ-47)', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let Quiz: ReturnType<typeof getQuizModel>;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq_quiz_model_test',
        launchTimeout: 60_000
      }
    });

    connection = await connectDatabase(mongo.getUri());
    Quiz = getQuizModel(connection);
    await Quiz.init();
  }, 90_000);

  beforeEach(async () => {
    await Quiz.deleteMany({});
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  const validQuizInput = (overrides: Partial<QuizFields> = {}): QuizFields => ({
    title: 'Computer Networks Transport Layer Quiz',
    subject: 'Computer Networks',
    questions: [new Types.ObjectId(), new Types.ObjectId()],
    creator: new Types.ObjectId(),
    ...overrides
  });

  it('UT-M2-QUIZ-01: creates and persists a valid Quiz document with title, subject, question references, creator, and timestamps', async () => {
    const input = validQuizInput();
    const quiz = await Quiz.create(input);

    expect(quiz._id).toBeInstanceOf(Types.ObjectId);
    expect(quiz.title).toBe('Computer Networks Transport Layer Quiz');
    expect(quiz.subject).toBe('Computer Networks');
    expect(quiz.questions).toHaveLength(2);
    expect(quiz.questions[0]!.toString()).toBe(input.questions[0]!.toString());
    expect(quiz.questions[1]!.toString()).toBe(input.questions[1]!.toString());
    expect(quiz.creator.toString()).toBe(input.creator.toString());
    expect(quiz.removedAt).toBeNull();
    expect(quiz.createdAt).toBeInstanceOf(Date);
    expect(quiz.updatedAt).toBeInstanceOf(Date);
  });

  it('UT-M2-QUIZ-02: rejects missing or empty title', async () => {
    const input = validQuizInput();
    delete (input as Partial<QuizFields>).title;

    await expect(Quiz.create(input)).rejects.toThrow(
      mongoose.Error.ValidationError
    );

    await expect(
      Quiz.create(validQuizInput({ title: '   ' }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('UT-M2-QUIZ-03: rejects title exceeding 150 characters', async () => {
    const longTitle = 'A'.repeat(151);
    await expect(
      Quiz.create(validQuizInput({ title: longTitle }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('UT-M2-QUIZ-04: rejects missing or empty subject', async () => {
    const input = validQuizInput();
    delete (input as Partial<QuizFields>).subject;

    await expect(Quiz.create(input)).rejects.toThrow(
      mongoose.Error.ValidationError
    );

    await expect(
      Quiz.create(validQuizInput({ subject: '   ' }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('UT-M2-QUIZ-05: rejects subject exceeding 100 characters', async () => {
    const longSubject = 'S'.repeat(101);
    await expect(
      Quiz.create(validQuizInput({ subject: longSubject }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('UT-M2-QUIZ-06: rejects missing or empty questions array', async () => {
    const inputWithoutQuestions = validQuizInput();
    delete (inputWithoutQuestions as Partial<QuizFields>).questions;

    await expect(Quiz.create(inputWithoutQuestions)).rejects.toThrow(
      mongoose.Error.ValidationError
    );

    await expect(
      Quiz.create(validQuizInput({ questions: [] }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('UT-M2-QUIZ-07: rejects duplicate question references in a quiz', async () => {
    const duplicateQuestionId = new Types.ObjectId();
    const input = validQuizInput({
      questions: [duplicateQuestionId, duplicateQuestionId]
    });

    await expect(Quiz.create(input)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('UT-M2-QUIZ-08: rejects missing creator', async () => {
    const input = validQuizInput();
    delete (input as Partial<QuizFields>).creator;

    await expect(Quiz.create(input)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('UT-M2-QUIZ-09: rejects unknown fields in strict mode', async () => {
    const inputWithExtra = {
      ...validQuizInput(),
      extraUnsupportedField: 'malicious'
    };

    await expect(Quiz.create(inputWithExtra)).rejects.toThrow(
      mongoose.Error.StrictModeError
    );
  });

  it('UT-M2-QUIZ-10: findQuizById retrieves existing quiz and returns null for non-existent or invalid ID', async () => {
    const created = await Quiz.create(validQuizInput());

    const foundByObjectId = await findQuizById(Quiz, created._id);
    expect(foundByObjectId).not.toBeNull();
    expect(foundByObjectId?._id.toString()).toBe(created._id.toString());

    const foundByString = await findQuizById(Quiz, created._id.toString());
    expect(foundByString).not.toBeNull();
    expect(foundByString?._id.toString()).toBe(created._id.toString());

    const notFound = await findQuizById(Quiz, new Types.ObjectId());
    expect(notFound).toBeNull();

    const invalidId = await findQuizById(Quiz, 'invalid-id-format');
    expect(invalidId).toBeNull();
  });

  it('UT-M2-QUIZ-11: deleteQuizById deletes existing quiz and returns null for non-existent or invalid ID', async () => {
    const created = await Quiz.create(validQuizInput());

    const deleted = await deleteQuizById(Quiz, created._id.toString());
    expect(deleted).not.toBeNull();
    expect(deleted?._id.toString()).toBe(created._id.toString());

    const verifyDeleted = await Quiz.findById(created._id);
    expect(verifyDeleted).toBeNull();

    const notFound = await deleteQuizById(Quiz, new Types.ObjectId());
    expect(notFound).toBeNull();

    const invalidId = await deleteQuizById(Quiz, 'invalid-id-format');
    expect(invalidId).toBeNull();
  });

  it('UT-M2-QUIZ-12: softDeleteQuizById marks quiz with removedAt and administrator ID', async () => {
    const created = await Quiz.create(validQuizInput());
    const adminId = new Types.ObjectId();

    const success = await softDeleteQuizById(Quiz, created._id, adminId);
    expect(success).toBe(true);

    const doc = await Quiz.findById(created._id).select('+removedBy');
    expect(doc?.removedAt).toBeInstanceOf(Date);
    expect(doc?.removedBy?.toString()).toBe(adminId.toString());

    // Subsequent removal returns false because removedAt is no longer null
    const duplicateRemoval = await softDeleteQuizById(Quiz, created._id, adminId);
    expect(duplicateRemoval).toBe(false);

    const invalidRemoval = await softDeleteQuizById(Quiz, 'invalid-id', adminId);
    expect(invalidRemoval).toBe(false);
  });

  it('UT-M2-QUIZ-13: reuses the model registered on the same connection', () => {
    const modelA = getQuizModel(connection);
    const modelB = getQuizModel(connection);
    expect(modelA).toBe(modelB);
  });

  it('UT-M2-QUIZ-14: rejects falsy or missing question ID elements in questions array', async () => {
    const input = validQuizInput({
      questions: [null as unknown as Types.ObjectId]
    });

    await expect(Quiz.create(input)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });
});
