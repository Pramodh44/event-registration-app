import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Analytics from "../../../models/analytics";

// POST /api/analytics - Store user tracking event
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    const logEntry = await Analytics.create({
      action,
      payload: payload || {},
      userAgent,
      ip,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, data: logEntry }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store analytics event: " + error.message },
      { status: 500 }
    );
  }
}

// GET /api/analytics - Get recent logged events
export async function GET() {
  try {
    await dbConnect();
    const logs = await Analytics.find({}).sort({ timestamp: -1 }).limit(20);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("Error in GET /api/analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics: " + error.message },
      { status: 500 }
    );
  }
}
