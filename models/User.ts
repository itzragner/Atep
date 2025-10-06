import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'organizer' | 'participant';
  fullName: string;
  points: number;
  workshopsRegistered: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'organizer', 'participant'],
      default: 'participant',
    },
    fullName: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    workshopsRegistered: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Workshop',
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;