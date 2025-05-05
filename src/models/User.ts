import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: [true, 'Role is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: false
  }],
  enrollmentDate: Date,
major: String,
currentClasses: [String],
emergencyContact: {
  name: String,
  phone: String,
  relationship: String,
}
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the model if it doesn't exist, otherwise use the existing one
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 