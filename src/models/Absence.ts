import mongoose from 'mongoose';

const AbsenceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  comment: { type: String },
  attachment: { type: String, default: null } // Store the filename of the uploaded file
});

export default mongoose.models.Absence || mongoose.model('Absence', AbsenceSchema);
