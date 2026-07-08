import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Registration from "../../../../models/registration";
import Event from "../../../../models/event"; // ensure the model is loaded

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    let query: any = {};
    if (eventId) {
      query.eventId = eventId;
    }

    const registrations = await Registration.find(query)
      .populate("eventId", "name")
      .sort({ _id: -1 });

    let csvContent = "Registration ID,Name,Email,Phone,Company/College,Referral Source,Event Name\n";
    for (const reg of registrations) {
      const eventName = reg.eventId && (reg.eventId as any).name
        ? (reg.eventId as any).name.replace(/"/g, '""')
        : "N/A";
      const name = reg.name ? reg.name.replace(/"/g, '""') : "";
      const email = reg.email ? reg.email.replace(/"/g, '""') : "";
      const phone = reg.phone ? reg.phone.replace(/"/g, '""') : "";
      const company = reg.company ? reg.company.replace(/"/g, '""') : "";
      const source = reg.source ? reg.source.replace(/"/g, '""') : "Direct";

      csvContent += `"${reg._id}","${name}","${email}","${phone}","${company}","${source}","${eventName}"\n`;
    }

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations_${eventId || "all"}_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/registrations/export:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export CSV: " + error.message },
      { status: 500 }
    );
  }
}
