import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  console.log('Login attempt received');
  
  try {
    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);
    
    if (!body.email || !body.password) {
      console.log('Missing email or password');
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    const { email, password } = body;
    
    // Connect to database
    console.log('Connecting to DB...');
    try {
      await connectDB();
      console.log('DB connected successfully');
    } catch (dbError) {
      console.error('DB connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Find user
    console.log('Finding user with email:', email);
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
      console.log('User search result:', user);
    } catch (findError) {
      console.error('Error finding user:', findError);
      return NextResponse.json({ 
        error: 'Error finding user',
        details: findError instanceof Error ? findError.message : 'Unknown error'
      }, { status: 500 });
    }

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Verify password
    if (user.password !== password) {
      console.log('Invalid password');
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Prepare response
    const responseData = { 
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
    console.log('Sending successful response:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Unexpected error in login route:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 