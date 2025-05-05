import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');

    let query: any = {};
    if (date) query.date = new Date(date);
    if (studentId) query.studentId = studentId;

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name email')
      .sort({ date: -1 });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}
