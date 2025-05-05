import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Absence from '@/models/Absence';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { status, comment } = await request.json();
        
        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await connectDB();
        const absence = await Absence.findByIdAndUpdate(
            params.id,
            { status, comment },
            { new: true }
        ).populate('student', 'name');

        if (!absence) {
            return NextResponse.json({ error: 'Absence not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            absence: {
                ...absence.toObject(),
                studentName: absence.student.name
            }
        });
    } catch (error) {
        console.error('Error updating absence:', error);
        return NextResponse.json({ error: 'Failed to update absence' }, { status: 500 });
    }
} 