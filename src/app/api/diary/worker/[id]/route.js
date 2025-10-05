import { NextResponse } from "next/server";
import DiaryEntry from "@/models/diaryEntryModel";
import Personal from "@/models/personalModel";
import connectDB from "@/database";

// GET /api/diary/worker/[id] - Get diary entries for a specific worker
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id: workerId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const projectId = searchParams.get("project");

    // Verify worker exists
    const worker = await Personal.findById(workerId);
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    let query = { worker: workerId };

    // Filter by project
    if (projectId) {
      query.project = projectId;
    }

    // Filter by specific date
    if (date) {
      const filterDate = DiaryEntry.formatDate(date);
      query.date = filterDate;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: DiaryEntry.formatDate(startDate),
        $lte: DiaryEntry.formatDate(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: DiaryEntry.formatDate(startDate) };
    } else if (endDate) {
      query.date = { $lte: DiaryEntry.formatDate(endDate) };
    }

    const entries = await DiaryEntry.find(query)
      .populate("worker", "name email")
      .populate("project", "name")
      .sort({ date: -1, startTime: -1 });

    // Calculate worker statistics
    const stats = {
      totalEntries: entries.length,
      totalHours: entries.reduce((sum, e) => sum + (e.totalHours || 0), 0),
      averageHoursPerDay:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + (e.totalHours || 0), 0) /
            entries.length
          : 0,
      projectsWorked: [...new Set(entries.map((e) => e.project._id.toString()))]
        .length,
      activeEntries: entries.filter((e) => e.status === "active").length,
    };

    return NextResponse.json({
      worker: {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
      },
      entries,
      stats,
    });
  } catch (error) {
    console.error("Error fetching worker diary:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker diary" },
      { status: 500 }
    );
  }
}
