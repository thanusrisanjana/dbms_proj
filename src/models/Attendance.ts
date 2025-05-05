   // src/models/Attendance.ts
   import mongoose from 'mongoose';

   const AttendanceSchema = new mongoose.Schema({
     student: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true,
     },
     class: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Class',
       required: true,
     },
     date: {
       type: Date,
       required: true,
     },
     status: {
       type: String,
       enum: ['present', 'absent'],
       required: true,
     },
     markedBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true,
     },
   });

   const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema, 'attendance');
   export default Attendance;