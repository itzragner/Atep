import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  location: string;
  time: Date;
  type: 'divertissement' | 'workshop';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['divertissement', 'workshop'],
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ActivitySchema.index({ time: 1 });
ActivitySchema.index({ type: 1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;