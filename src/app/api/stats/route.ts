import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';

export async function GET() {
  try {
    await connectDB();

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalClasses = await Class.countDocuments();

    // Attendance stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = await Attendance.countDocuments({ date: today, status: 'present' });
    const absentToday = await Attendance.countDocuments({ date: today, status: 'absent' });

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      presentToday,
      absentToday,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
