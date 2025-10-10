import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkshop extends Document {
  title: string;
  description: string;
  location: string;
  time: Date;
  points: number;
  maxParticipants?: number;
  organizerId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  qrCode?: string;
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
      required: true,
      default: 10,
    },
    maxParticipants: {
      type: Number,
      default: 50,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

WorkshopSchema.index({ time: 1 });
WorkshopSchema.index({ organizerId: 1 });

// ✅ FIX: Prevent model overwrite error
const Workshop: Model<IWorkshop> = mongoose.models.Workshop || mongoose.model<IWorkshop>('Workshop', WorkshopSchema);

export default Workshop;