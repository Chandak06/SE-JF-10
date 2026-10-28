import {
  Schema,
  Types,
  type Connection,
  type HydratedDocument,
  type Model
} from 'mongoose';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionFields {
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  marks?: number;
  creator?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  removedAt?: Date | null;
  removedBy?: Types.ObjectId;
}

const optionSchema = new Schema<QuestionOption>(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500
    }
  },
  {
    _id: false
  }
);

export const questionSchema = new Schema<QuestionFields>(
  {
    removedAt: { type: Date, default: null, index: true },
    removedBy: { type: Schema.Types.ObjectId, ref: 'User', select: false },
    questionText: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator(options: QuestionOption[]) {
          if (
            !Array.isArray(options) ||
            options.length < 2 ||
            options.length > 6
          ) {
            return false;
          }
          const ids = options.map((opt) => opt?.id?.trim()).filter(Boolean);
          return new Set(ids).size === options.length;
        },
        message: 'Question must have between 2 and 6 options with unique IDs.'
      }
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator(this: unknown, val: string) {
          const doc = this as { options?: QuestionOption[] };
          if (!Array.isArray(doc?.options) || doc.options.length === 0) {
            return false;
          }
          return doc.options.some((opt) => opt && opt.id === val);
        },
        message: 'correctAnswer must match the id of one of the options.'
      }
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
      index: true
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      index: true
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: {
        validator(val: number) {
          return Number.isInteger(val);
        },
        message: 'marks must be an integer.'
      }
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw'
  }
);

questionSchema.index({ subject: 1, topic: 1, difficulty: 1 });

export type QuestionDocument = HydratedDocument<QuestionFields>;

export function getQuestionModel(
  connection: Connection
): Model<QuestionFields> {
  return (
    (connection.models.Question as Model<QuestionFields> | undefined) ??
    connection.model<QuestionFields>('Question', questionSchema)
  );
}
