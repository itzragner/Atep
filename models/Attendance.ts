import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAttendance extends Document {
  participantId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  timestamp: Date;
  method: 'qr' | 'manual';
  validatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ['qr', 'manual'],
      required: true,
    },
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index({ participantId: 1, workshopId: 1 }, { unique: true });
AttendanceSchema.index({ workshopId: 1 });

// ✅ FIX: Prevent model overwrite error
const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;