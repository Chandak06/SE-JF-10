import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import mongoose from 'mongoose';

import { connectDatabase } from '../../src/db.js';
import {
  getQuestionModel,
  type QuestionFields
} from '../../src/models/question.js';

describe('Question model (CSMQ-22)', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let Question: ReturnType<typeof getQuestionModel>;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq_question_model_test',
        launchTimeout: 60_000
      }
    });

    connection = await connectDatabase(mongo.getUri());
    Question = getQuestionModel(connection);
    await Question.init();
  }, 90_000);

  beforeEach(async () => {
    await Question.deleteMany({});
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  it('UT-M2-01: creates and persists a valid Question with MCQ fields, timestamps, and creator', async () => {
    const creatorId = new mongoose.Types.ObjectId();
    const validQuestion: QuestionFields = {
      questionText: 'Which protocol provides reliable, connection-oriented communication?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' },
        { id: 'C', text: 'ARP' },
        { id: 'D', text: 'ICMP' }
      ],
      correctAnswer: 'B',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      difficulty: 'Easy',
      marks: 1,
      creator: creatorId
    };

    const question = await Question.create(validQuestion);

    expect(question._id).toBeDefined();
    expect(question.questionText).toBe(validQuestion.questionText);
    expect(question.options).toHaveLength(4);
    expect(question.options[1]?.id).toBe('B');
    expect(question.options[1]?.text).toBe('TCP');
    expect(question.correctAnswer).toBe('B');
    expect(question.subject).toBe('Computer Networks');
    expect(question.topic).toBe('Transport Layer');
    expect(question.difficulty).toBe('Easy');
    expect(question.marks).toBe(1);
    expect(question.creator?.toString()).toBe(creatorId.toString());
    expect(question.get('createdAt')).toBeInstanceOf(Date);
    expect(question.get('updatedAt')).toBeInstanceOf(Date);

    const stored = await Question.findById(question._id).exec();
    expect(stored).not.toBeNull();
    expect(stored?.questionText).toBe(validQuestion.questionText);
  });

  it('UT-M2-02: rejects missing question text', async () => {
    const incomplete = new Question({
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' }
      ],
      correctAnswer: 'A',
      subject: 'Computer Networks',
      topic: 'Protocols',
      difficulty: 'Easy'
    });

    await expect(incomplete.validate()).rejects.toThrow();
  });

  it('UT-M2-02: rejects missing subject', async () => {
    const incomplete = new Question({
      questionText: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '3' },
        { id: 'B', text: '4' }
      ],
      correctAnswer: 'B',
      topic: 'Arithmetic',
      difficulty: 'Easy'
    });

    await expect(incomplete.validate()).rejects.toThrow();
  });

  it('UT-M2-02: rejects missing topic', async () => {
    const incomplete = new Question({
      questionText: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '3' },
        { id: 'B', text: '4' }
      ],
      correctAnswer: 'B',
      subject: 'Math',
      difficulty: 'Easy'
    });

    await expect(incomplete.validate()).rejects.toThrow();
  });

  it('UT-M2-02: rejects missing or invalid difficulty', async () => {
    const invalidDifficulty = new Question({
      questionText: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '3' },
        { id: 'B', text: '4' }
      ],
      correctAnswer: 'B',
      subject: 'Math',
      topic: 'Arithmetic',
      difficulty: 'SuperHard' as unknown as 'Hard'
    });

    await expect(invalidDifficulty.validate()).rejects.toThrow();
  });

  it('UT-M2-02: rejects fewer than two options', async () => {
    const singleOption = new Question({
      questionText: 'What is 2 + 2?',
      options: [{ id: 'A', text: '4' }],
      correctAnswer: 'A',
      subject: 'Math',
      topic: 'Arithmetic',
      difficulty: 'Easy'
    });

    await expect(singleOption.validate()).rejects.toThrow();
  });

  it('UT-M2-02: rejects more than six options in the database model', async () => {
    const sevenOptions = new Question({
      questionText: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '1' },
        { id: 'B', text: '2' },
        { id: 'C', text: '3' },
        { id: 'D', text: '4' },
        { id: 'E', text: '5' },
        { id: 'F', text: '6' },
        { id: 'G', text: '7' }
      ],
      correctAnswer: 'D',
      subject: 'Math',
      topic: 'Arithmetic',
      difficulty: 'Easy'
    });

    await expect(sevenOptions.validate()).rejects.toThrow(
      /Question must have between 2 and 6 options/
    );
  });

  it('UT-M2-02: rejects fractional marks in the database model', async () => {
    const fractionalMarks = new Question({
      questionText: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '3' },
        { id: 'B', text: '4' }
      ],
      correctAnswer: 'B',
      subject: 'Math',
      topic: 'Arithmetic',
      difficulty: 'Easy',
      marks: 1.5
    });

    await expect(fractionalMarks.validate()).rejects.toThrow(
      /marks must be an integer/
    );
  });

  it('UT-M2-02: rejects option text longer than 500 characters in the database model', async () => {
    const longOptionText = new Question({
      questionText: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '3' },
        { id: 'B', text: 'x'.repeat(501) }
      ],
      correctAnswer: 'B',
      subject: 'Math',
      topic: 'Arithmetic',
      difficulty: 'Easy'
    });

    await expect(longOptionText.validate()).rejects.toThrow();
  });

  it('UT-M2-02: rejects duplicate option IDs', async () => {
    const duplicateIds = new Question({
      questionText: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '4' },
        { id: 'A', text: '5' }
      ],
      correctAnswer: 'A',
      subject: 'Math',
      topic: 'Arithmetic',
      difficulty: 'Easy'
    });

    await expect(duplicateIds.validate()).rejects.toThrow();
  });

  it('UT-M2-03: rejects when correctAnswer does not match any allowed option ID', async () => {
    const wrongAnswer = new Question({
      questionText: 'Which protocol provides reliable communication?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' }
      ],
      correctAnswer: 'Z',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      difficulty: 'Easy'
    });

    await expect(wrongAnswer.validate()).rejects.toThrow(
      /correctAnswer must match the id of one of the options/
    );

    const missingOptions = new Question({
      questionText: 'Which protocol provides reliable communication?',
      correctAnswer: 'A',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      difficulty: 'Easy'
    });

    await expect(missingOptions.validate()).rejects.toThrow();
  });

  it('allows question creation without optional creator field', async () => {
    const question = await Question.create({
      questionText: 'What does CPU stand for?',
      options: [
        { id: 'A', text: 'Central Processing Unit' },
        { id: 'B', text: 'Computer Personal Unit' }
      ],
      correctAnswer: 'A',
      subject: 'Computer Organization',
      topic: 'Processor',
      difficulty: 'Easy'
    });

    expect(question._id).toBeDefined();
    expect(question.creator).toBeUndefined();
  });

  it('reuses the model registered on the same connection', () => {
    expect(getQuestionModel(connection)).toBe(Question);
  });
});
