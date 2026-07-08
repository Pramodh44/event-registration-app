import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Event from "../../../models/event";
import Registration from "../../../models/registration";

export async function GET() {
  try {
    await dbConnect();

    // 1. Total events count
    const totalEvents = await Event.countDocuments({});

    // 2. Total registrations count
    const totalRegistrations = await Registration.countDocuments({});

    // 3. Average registrations per event
    const avgRegistrations = totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : "0";

    // 4. Total capacity vs filled seats
    const eventsData = await Event.find({}).sort({ date: 1 });
    let totalCapacity = 0;
    let totalRegisteredCount = 0;
    eventsData.forEach(event => {
      totalCapacity += event.totalSeats || 0;
      totalRegisteredCount += event.registeredCount || 0;
    });

    const seatOccupancyRate = totalCapacity > 0 ? ((totalRegisteredCount / totalCapacity) * 100).toFixed(1) : "0";

    // 5. Recent registrations (last 10)
    const recentRegistrations = await Registration.find({})
      .populate("eventId", "name")
      .sort({ _id: -1 })
      .limit(10);

    // 6. Source Breakdown
    const sourceStats = await Registration.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    const sourceBreakdown = sourceStats.map(stat => ({
      source: stat._id || "Direct",
      count: stat.count,
      percentage: totalRegistrations > 0 ? ((stat.count / totalRegistrations) * 100).toFixed(1) : "0"
    }));

    // 7. Category Breakdown
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          eventCount: { $sum: 1 },
          registrationCount: { $sum: "$registeredCount" }
        }
      },
      { $sort: { registrationCount: -1 } }
    ]);
    const categoryBreakdown = categoryStats.map(stat => ({
      category: stat._id,
      eventCount: stat.eventCount,
      registrationCount: stat.registrationCount
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        avgRegistrations,
        totalCapacity,
        totalRegisteredCount,
        seatOccupancyRate,
        recentRegistrations,
        sourceBreakdown,
        categoryBreakdown,
        events: eventsData
      }
    });
  } catch (error: any) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics: " + error.message },
      { status: 500 }
    );
  }
}
