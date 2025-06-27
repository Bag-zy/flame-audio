import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/user";

// Disable caching for this route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { 
          message: "An account with this email already exists.",
          code: "USER_EXISTS",
          suggestion: "Please log in or use a different email address."
        },
        { status: 409 } // 409 Conflict is more appropriate for duplicate resources
      );
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Return success response with user data (excluding password)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    
    // Handle duplicate key errors (in case unique index check fails)
    const isDuplicateError = error && 
      typeof error === 'object' && 
      'code' in error && 
      (error.code === 11000 || error.code === 'MONGO_ERROR_DUPLICATE_KEY');
      
    if (isDuplicateError) {
      return NextResponse.json(
        { 
          message: "An account with this email already exists.",
          code: "USER_EXISTS",
          suggestion: "Please log in or use a different email address."
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        message: "An unexpected error occurred. Please try again.",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}
