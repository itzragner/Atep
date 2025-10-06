import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Notification extends Document {
  message: string;
  recipientRole: 'admin' | 'organizer' | 'participant' | 'all';
  timestamp: Date;
  relatedWorkshopId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  type: 'info' | 'warning' | 'reminder' | 'update';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<Notification>(
  {
    message: {
      type: String,
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'organizer', 'participant', 'all'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    relatedWorkshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'reminder', 'update'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientRole: 1, timestamp: -1 });
NotificationSchema.index({ relatedWorkshopId: 1 });

const Notification: Model<Notification> =
  mongoose.models.Notification ||
  mongoose.model<Notification>('Notification', NotificationSchema);

export default Notification;