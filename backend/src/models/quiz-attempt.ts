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
      min: 0
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw'
  }
);

export type QuizAttemptDocument = HydratedDocument<QuizAttemptFields>;

export function getQuizAttemptModel(
  connection: Connection
): Model<QuizAttemptFields> {
  return (
    (connection.models.QuizAttempt as Model<QuizAttemptFields> | undefined) ??
    connection.model<QuizAttemptFields>('QuizAttempt', quizAttemptSchema)
  );
}