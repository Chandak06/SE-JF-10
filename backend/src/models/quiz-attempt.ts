import {
  Schema,
  Types,
  type Connection,
  type HydratedDocument,
  type Model
} from 'mongoose';

export interface AttemptResponse {
  questionId: Types.ObjectId;
  selectedOption: string;
}

export interface QuizAttemptFields {
  user: Types.ObjectId;
  quiz: Types.ObjectId;
  responses: AttemptResponse[];
  score: number;
  percentage: number;
  submissionKey?: string;
  submissionDigest?: string;
}

const responseSchema = new Schema<AttemptResponse>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Question'
    },
    selectedOption: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: false,
    strict: 'throw'
  }
);

const quizAttemptSchema = new Schema<QuizAttemptFields>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    quiz: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Quiz',
      index: true
    },
    responses: {
      type: [responseSchema],
      required: true,
      default: []
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value: number) =>
          Number.isFinite(value) && Number.isInteger(value),
        message: 'Score must be a finite non-negative integer.'
      }
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    submissionKey: { type: String, select: false },
    submissionDigest: { type: String, select: false }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw'
  }
);

// Separate attempts can repeat a quiz; retries of one submission share one record.
quizAttemptSchema.index({ user: 1, submissionKey: 1 }, {
  unique: true, partialFilterExpression: { submissionKey: { $type: 'string' } }
});

export type QuizAttemptDocument =
  HydratedDocument<QuizAttemptFields>;

export function getQuizAttemptModel(
  connection: Connection
): Model<QuizAttemptFields> {
  return (
    (connection.models.QuizAttempt as
      | Model<QuizAttemptFields>
      | undefined) ??
    connection.model<QuizAttemptFields>(
      'QuizAttempt',
      quizAttemptSchema
    )
  );
}
