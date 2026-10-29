
import { Types, type Connection } from 'mongoose';

import { getQuestionModel } from '../models/question.js';
import { getQuizAttemptModel } from '../models/quiz-attempt.js';

import type {
  AttemptRepository,
  AttemptToSave
} from './submission-service.js';

interface StoredQuiz {
  _id: Types.ObjectId;
  questions: Types.ObjectId[];
  removedAt?: Date | null;
}

export function createMongoAttemptRepository(
  connection: Connection
): AttemptRepository {
  const quizzes = connection.collection<StoredQuiz>('quizzes');
  const Question = getQuestionModel(connection);
  const QuizAttempt = getQuizAttemptModel(connection);

  return {
    // Retrieve quiz and its assigned question IDs.
    async findQuiz(quizId) {
      if (!Types.ObjectId.isValid(quizId)) {
        return null;
      }

      const quiz = await quizzes.findOne({
        _id: new Types.ObjectId(quizId)
      });

      if (!quiz) {
        return null;
      }

      return {
        id: quiz._id.toString(),
        questionIds: Array.isArray(quiz.questions)
          ? quiz.questions.map((id) => id.toString())
          : [],
        removedAt: quiz.removedAt ?? null
      };
    },

    // Retrieve trusted questions directly from MongoDB.
    async findQuestions(questionIds) {
      const ids = questionIds.map(
        (id) => new Types.ObjectId(id)
      );

      const questions = await Question.find({
        _id: { $in: ids }, removedAt: null
      })
        .lean()
        .exec();

      return questions.map((question) => ({
        id: question._id.toString(),
        correctAnswer: question.correctAnswer,
        options: question.options.map((option) => ({
          id: option.id
        }))
      }));
    },

    // Persist the attempt and server-calculated result.
    async saveAttempt(attempt: AttemptToSave) {
      const saved = await QuizAttempt.create({
        user: new Types.ObjectId(attempt.userId),
        quiz: new Types.ObjectId(attempt.quizId),

        responses: attempt.responses.map((response) => ({
          questionId: new Types.ObjectId(response.questionId),
          selectedOption: response.selectedOptionId
        })),

        score: attempt.score,
        percentage: attempt.percentage
      });

      return {
        id: saved._id.toString()
      };
    }
  };
}
