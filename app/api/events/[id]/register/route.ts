import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import Event from "../../../../../models/event";
import Registration from "../../../../../models/registration";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const { name, email, phone, company, source } = body;

    // 1. Basic validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required fields." },
        { status: 400 }
      );
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Phone regex check (allows numbers, spaces, dashes, parentheses, plus sign)
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid phone number (at least 7 digits)." },
        { status: 400 }
      );
    }

    // 2. Fetch event & verify status
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event is full
    if (event.registeredCount >= event.totalSeats) {
      return NextResponse.json(
        { success: false, error: "Registration failed: This event is already fully booked." },
        { status: 400 }
      );
    }

    // 3. Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      email: email.toLowerCase(),
      eventId: id,
    });
    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: "You are already registered for this event with this email." },
        { status: 400 }
      );
    }

    // 4. Create registration and atomically increment event registered count
    let newRegistration;
    try {
      newRegistration = await Registration.create({
        name,
        email: email.toLowerCase(),
        phone,
        company: company || "",
        source: source || "Direct",
        eventId: id,
      });
    } catch (dbErr: any) {
      // Handle potential index unique violation (code 11000)
      if (dbErr.code === 11000) {
        return NextResponse.json(
          { success: false, error: "You are already registered for this event with this email." },
          { status: 400 }
        );
      }
      throw dbErr;
    }

    // Update count atomically
    await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully!",
      data: newRegistration,
    });
  } catch (error: any) {
    console.error("Error in POST /api/events/[id]/register:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process registration: " + error.message },
      { status: 500 }
    );
  }
}
