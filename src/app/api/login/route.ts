import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb'; // Adjust the path if needed
import User from '@/models/User'; // Adjust the path if needed

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Check password (in production, use hashed passwords!)
  if (user.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Remove password before sending user data
  const { password: _, ...userData } = user.toObject();

  // You may want to set a cookie or session here for authentication

  return NextResponse.json({ user: userData });
}
