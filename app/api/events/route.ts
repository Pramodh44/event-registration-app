import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Event from "../../../models/event";

// GET /api/events - Retrieve events with optional server-side filtering
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const mode = searchParams.get("mode");

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    if (mode && mode !== "All") {
      query.mode = { $regex: new RegExp(`^${mode}$`, "i") };
    }

    const events = await Event.find(query).sort({ date: 1 });
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error("Error in GET /api/events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events: " + error.message },
      { status: 500 },
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, date, category, mode, description, totalSeats } = body;

    if (!name || !date || !category || !mode || totalSeats === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, date, category, mode, totalSeats)" },
        { status: 400 },
      );
    }

    if (totalSeats < 1) {
      return NextResponse.json(
        { success: false, error: "Total seats must be at least 1" },
        { status: 400 },
      );
    }

    const newEvent = await Event.create({
      name,
      date: new Date(date),
      category,
      mode,
      description: description || "",
      totalSeats: Number(totalSeats),
      registeredCount: 0,
    });

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event: " + error.message },
      { status: 500 },
    );
  }
}

