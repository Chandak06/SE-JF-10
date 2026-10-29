
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types, type Connection } from 'mongoose';

import { connectDatabase } from '../../src/db.js';
import { getQuestionModel } from '../../src/models/question.js';
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js';
import { createMongoAttemptRepository } from '../../src/attempts/mongo-repository.js';
import { submitQuizAttempt } from '../../src/attempts/submission-service.js';

describe('CSMQ-40: MongoDB attempt repository', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let repository: ReturnType<typeof createMongoAttemptRepository>;
  let Question: ReturnType<typeof getQuestionModel>;
  let QuizAttempt: ReturnType<typeof getQuizAttemptModel>;

  let quizId: Types.ObjectId;
  let firstId: string;
  let secondId: string;

  const userId = new Types.ObjectId();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq40_attempt_repository',
        launchTimeout: 60000
      }
    });

    connection = await connectDatabase(mongo.getUri());
    Question = getQuestionModel(connection);
    QuizAttempt = getQuizAttemptModel(connection);
    repository = createMongoAttemptRepository(connection);
  }, 90000);

  beforeEach(async () => {
    await Question.deleteMany({});
    await QuizAttempt.deleteMany({});
    await connection.collection('quizzes').deleteMany({});

    const first = await Question.create({
      questionText: 'Which protocol is connection-oriented?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' }
      ],
      correctAnswer: 'B',
      subject: 'Computer Networks',
      topic: 'Protocols',
      difficulty: 'Easy',
      marks: 1
    });

    const second = await Question.create({
      questionText: 'Which data structure uses FIFO?',
      options: [
        { id: 'A', text: 'Queue' },
        { id: 'B', text: 'Stack' }
      ],
      correctAnswer: 'A',
      subject: 'Data Structures',
      topic: 'Queues',
      difficulty: 'Easy',
      marks: 1
    });

    firstId = first._id.toString();
    secondId = second._id.toString();
    quizId = new Types.ObjectId();

    await connection.collection('quizzes').insertOne({
      _id: quizId,
      title: 'CS Practice Quiz',
      subject: 'Computer Science',
      questions: [first._id, second._id],
      creator: userId,
      removedAt: null
    });
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  it('fetches a quiz and its trusted questions', async () => {
    const quiz = await repository.findQuiz(quizId.toString());

    expect(quiz).toMatchObject({
      id: quizId.toString(),
      questionIds: [firstId, secondId],
      removedAt: null
    });

    const questions = await repository.findQuestions([
      firstId,
      secondId
    ]);

    expect(questions).toHaveLength(2);

    expect(
      questions.find((question) => question.id === firstId)
        ?.correctAnswer
    ).toBe('B');
  });

  it('evaluates and persists a real quiz attempt', async () => {
    const result = await submitQuizAttempt(
      {
        quizId: quizId.toString(),
        responses: [
          { questionId: firstId, selectedOptionId: 'B' },
          { questionId: secondId, selectedOptionId: 'B' }
        ]
      },
      userId.toString(),
      repository
    );

    expect(result).toMatchObject({
      score: 1,
      total: 2,
      percentage: 50,
      correct: 1,
      incorrect: 1,
      unanswered: 0
    });

    const saved = await QuizAttempt.findById(
      result.attemptId
    ).lean();

    expect(saved).not.toBeNull();
    expect(saved?.user.toString()).toBe(userId.toString());
    expect(saved?.quiz.toString()).toBe(quizId.toString());
    expect(saved?.score).toBe(1);
    expect(saved?.percentage).toBe(50);
    expect(saved?.responses).toHaveLength(2);
    expect(saved?.responses[0]?.selectedOption).toBe('B');
  });

  it('rejects a nonexistent quiz without saving', async () => {
    await expect(
      submitQuizAttempt(
        {
          quizId: new Types.ObjectId().toString(),
          responses: []
        },
        userId.toString(),
        repository
      )
    ).rejects.toMatchObject({
      code: 'QUIZ_NOT_FOUND'
    });

    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects a removed quiz without saving', async () => {
    await connection.collection('quizzes').updateOne(
      { _id: quizId },
      { $set: { removedAt: new Date() } }
    );

    await expect(
      submitQuizAttempt(
        {
          quizId: quizId.toString(),
          responses: []
        },
        userId.toString(),
        repository
      )
    ).rejects.toMatchObject({
      code: 'QUIZ_NOT_FOUND'
    });

    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects invalid options without persisting', async () => {
    await expect(
      submitQuizAttempt(
        {
          quizId: quizId.toString(),
          responses: [
            {
              questionId: firstId,
              selectedOptionId: 'Z'
            }
          ]
        },
        userId.toString(),
        repository
      )
    ).rejects.toMatchObject({
      code: 'INVALID_OPTION'
    });

    expect(await QuizAttempt.countDocuments()).toBe(0);
  });
});
