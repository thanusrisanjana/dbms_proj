import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';

export async function GET() {
  try {
    await connectDB();
    
    const classes = await Class.find()
      .select('name _id')
      .sort({ name: 1 });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
} 