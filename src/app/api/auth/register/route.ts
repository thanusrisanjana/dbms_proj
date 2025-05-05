import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
// import bcrypt from 'bcryptjs'; // Uncomment if you want to hash passwords

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Hash the password (optional but recommended)
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await User.create({
      email,
      // password: hashedPassword, // Use this if hashing
      password, // Use this if NOT hashing
      name,
      role: role.toLowerCase(), // Ensure role is lowercase
    });
    
    return NextResponse.json({ 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 