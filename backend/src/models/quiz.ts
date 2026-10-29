import {
  Schema,
  Types,
  type Connection,
  type HydratedDocument,
  type Model
} from 'mongoose';

export interface QuizFields {
  title: string;
  subject: string;
  questions: Types.ObjectId[];
  creator: Types.ObjectId;
  removedAt?: Date | null;
  removedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export const quizSchema = new Schema<QuizFields>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 150
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
      index: true
    },
    questions: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true
        }
      ],
      required: true,
      validate: {
        validator(questions: Types.ObjectId[]) {
          if (!Array.isArray(questions) || questions.length === 0) {
            return false;
          }
          const ids = questions.map((id) => id?.toString()).filter(Boolean);
          if (ids.length !== questions.length) {
            return false;
          }
          return new Set(ids).size === questions.length;
        },
        message: 'Quiz must contain at least one question and question references must be unique.'
      }
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    removedAt: {
      type: Date,
      default: null,
      index: true
    },
    removedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      select: false,
      required: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw'
  }
);

quizSchema.index({ subject: 1, createdAt: -1 });

export type QuizDocument = HydratedDocument<QuizFields>;

export function getQuizModel(connection: Connection): Model<QuizFields> {
  return (
    (connection.models.Quiz as Model<QuizFields> | undefined) ??
    connection.model<QuizFields>('Quiz', quizSchema)
  );
}

/**
 * Model-level fetch by ID.
 * Returns the Quiz document or null if not found.
 */
export async function findQuizById(
  Quiz: Model<QuizFields>,
  id: string | Types.ObjectId
): Promise<QuizDocument | null> {
  if (typeof id === 'string' && !Types.ObjectId.isValid(id)) {
    return null;
  }
  return Quiz.findById(id).exec();
}

/**
 * Model-level delete by ID (hard delete).
 * Returns the deleted Quiz document or null if not found.
 */
export async function deleteQuizById(
  Quiz: Model<QuizFields>,
  id: string | Types.ObjectId
): Promise<QuizDocument | null> {
  if (typeof id === 'string' && !Types.ObjectId.isValid(id)) {
    return null;
  }
  return Quiz.findByIdAndDelete(id).exec();
}

/**
 * Model-level soft delete by ID for administrative moderation.
 * Marks the quiz with removedAt and removedBy.
 */
export async function softDeleteQuizById(
  Quiz: Model<QuizFields>,
  id: string | Types.ObjectId,
  administratorId: string | Types.ObjectId
): Promise<boolean> {
  if (typeof id === 'string' && !Types.ObjectId.isValid(id)) {
    return false;
  }
  const result = await Quiz.updateOne(
    { _id: id, removedAt: null },
    {
      $set: {
        removedAt: new Date(),
        removedBy: new Types.ObjectId(administratorId)
      }
    }
  ).exec();
  return result.modifiedCount === 1;
}
