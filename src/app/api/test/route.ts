import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      status: 'success',
      message: 'MongoDB connection successful'
    });
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to connect to MongoDB'
    }, { status: 500 });
  }
} 