import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import connectDB from '@/lib/mongodb';
import Absence from '@/models/Absence';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const date = formData.get('date') as string;
    const reason = formData.get('reason') as string;
    const studentId = formData.get('studentId') as string;
    const studentName = formData.get('studentName') as string;

    if (!file || !date || !reason || !studentId || !studentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file to uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Connect to database and save absence record
    await connectDB();
    const absence = new Absence({
      student: studentId,
      date: new Date(date),
      reason,
      status: 'Pending',
      attachment: fileName,
    });
    await absence.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Absence submitted successfully',
      absence: {
        ...absence.toObject(),
        studentName
      }
    });
  } catch (error) {
    console.error('Error submitting absence:', error);
    return NextResponse.json({ error: 'Failed to submit absence' }, { status: 500 });
  }
} 