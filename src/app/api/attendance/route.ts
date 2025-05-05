import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');
    const filter: any = {};
    if (classId && classId !== 'all') filter.class = classId;
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      filter.date = { $gte: start, $lt: end };

      console.log('Searching attendance from', start, 'to', end);
    }
    if (studentId) filter.student = studentId;
    console.log('Attendance API GET called with:');
    console.log('classId:', classId, 'date:', date, 'studentId:', studentId);
    console.log('MongoDB filter:', filter);

    const attendance = await Attendance.find(filter)
      .populate('student', 'name')
      .populate('class', 'name');
      console.log('Attendance records found:', attendance);

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    console.log('Received attendance data:', data);

    // Validation
    if (!data.class || !data.date || !Array.isArray(data.records)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (data.class === 'all') {
      return NextResponse.json({ error: 'Cannot save attendance for all classes at once.' }, { status: 400 });
    }

    // Remove old records for this class/date
    await Attendance.deleteMany({ class: data.class, date: new Date(data.date) });

    // Prepare new records
    const records = data.records.map((rec: any) => ({
      ...rec,
      class: data.class,
      date: new Date(data.date),
      markedBy: data.markedBy,
    }));

    // Insert new records
    const result = await Attendance.insertMany(records);
    console.log('Inserted attendance records:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
