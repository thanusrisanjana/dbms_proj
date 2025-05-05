import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User'; // Adjust path as needed

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const user = await User.findById(userId).populate('classes');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const data = await req.json();
  const allowedFields = ['enrollmentDate', 'major', 'currentClasses', 'emergencyContact'];
  const update: any = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) update[field] = data[field];
  });

  const updated = await User.findByIdAndUpdate(userId, data, { new: true });
  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(updated);
}
