import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Event from "../../../../models/event";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    console.error("Error in GET /api/events/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event: " + error.message },
      { status: 500 }
    );
  }
}
