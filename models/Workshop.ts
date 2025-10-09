import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkshop extends Document {
  title: string;
  description: string;
  location: string;
  time: Date;
  points: number;
  participants: mongoose.Types.ObjectId[];
  qrCode: string;
  organizerId: mongoose.Types.ObjectId;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkshopSchema = new Schema<IWorkshop>(
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
    points: {
      type: Number,
      default: 10,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    qrCode: {
      type: String,
      default: '', 
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxParticipants: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

WorkshopSchema.index({ time: 1 });
WorkshopSchema.index({ organizerId: 1 });

const Workshop: Model<IWorkshop> =
  mongoose.models.Workshop || mongoose.model<IWorkshop>('Workshop', WorkshopSchema);

export default Workshop;