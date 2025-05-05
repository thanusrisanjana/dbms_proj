   // src/models/Class.ts
   import mongoose from 'mongoose';

   const classSchema = new mongoose.Schema({
     name: {
       type: String,
       required: [true, 'Class name is required'],
       trim: true,
     },
     teacher: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: [true, 'Teacher is required'],
     },
     students: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
     }],
     schedule: {
       day: String,
       time: String,
     },
     createdAt: {
       type: Date,
       default: Date.now,
     },
   });

   const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
   export default Class;