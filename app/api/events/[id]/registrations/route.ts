import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import Registration from "../../../../../models/registration";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const registrations = await Registration.find({ eventId: id }).sort({ _id: -1 });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error: any) {
    console.error("Error in GET /api/events/[id]/registrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations: " + error.message },
      { status: 500 }
    );
  }
}
