import type {
  QuestionDifficulty,
  QuestionFields,
  QuestionOption
} from '../models/question.js';

export interface StudentSafeOption {
  id: string;
  text: string;
}

export interface StudentSafeQuestion {
  id: string;
  questionText: string;
  options: StudentSafeOption[];
  difficulty?: QuestionDifficulty;
  marks?: number;
  subject?: string;
  topic?: string;
}

export interface StudentSafeQuizPayload {
  quizId?: string;
  title?: string;
  questions: StudentSafeQuestion[];
}

export type QuestionInputLike = {
  _id?: unknown;
  id?: string;
  questionText?: string;
  options?: Array<{ id: unknown; text: unknown }>;
  difficulty?: QuestionDifficulty;
  marks?: number;
  subject?: string;
  topic?: string;
  correctAnswer?: unknown;
  creator?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  __v?: unknown;
};

/**
 * Transforms an internal Question document or object into a student-safe payload.
 * Guarantees that correctAnswer, correctOption, and answer keys are completely omitted.
 */
export function toStudentSafeQuestion(
  question: QuestionInputLike
): StudentSafeQuestion {
  const id = question.id ?? (question._id ? String(question._id) : '');
  const options = Array.isArray(question.options)
    ? question.options.map((opt) => ({
        id: String(opt.id ?? ''),
        text: String(opt.text ?? '')
      }))
    : [];

  const safe: StudentSafeQuestion = {
    id,
    questionText: question.questionText ?? '',
    options,
    difficulty: question.difficulty,
    marks: question.marks ?? 1,
    subject: question.subject,
    topic: question.topic
  };

  return safe;
}

/**
 * Serializes an array of Question objects into student-safe question DTOs.
 */
export function toStudentSafeQuestions(
  questions: QuestionInputLike[]
): StudentSafeQuestion[] {
  return questions.map(toStudentSafeQuestion);
}

/**
 * Wraps questions into the Quiz Attempt UI contract payload matching docs/attempt-api-contract.md.
 */
export function toStudentSafeQuizPayload(
  questions: QuestionInputLike[],
  options: { quizId?: string; title?: string } = {}
): StudentSafeQuizPayload {
  return {
    quizId: options.quizId ?? 'practice-quiz-sprint1',
    title: options.title ?? 'Practice Quiz',
    questions: toStudentSafeQuestions(questions)
  };
}
