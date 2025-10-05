import { NextResponse } from "next/server";
import DiaryEntry from "@/models/diaryEntryModel";
import Proyecto from "@/models/projectModel";
import connectDB from "@/database";

// GET /api/diary/project/[id] - Get diary entries for a specific project
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status"); // 'active' or 'completed'

    // Verify project exists
    const project = await Proyecto.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let query = { project: projectId };

    // Filter by specific date (only when date parameter is provided)
    if (date) {
      // For a specific date, we want to find entries on that exact date
      const targetDate = new Date(date);
      const startOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      const endOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate() + 1
      );

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const entries = await DiaryEntry.find(query)
      .populate("worker", "name email")
      .populate("project", "name")
      .sort({ date: -1, startTime: -1 });

    // Group entries by date for easier display
    const groupedEntries = entries.reduce((acc, entry) => {
      const dateKey = entry.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    }, {});

    // Calculate project statistics
    const stats = {
      totalEntries: entries.length,
      activeWorkers: entries.filter((e) => e.status === "active").length,
      totalHours: entries.reduce((sum, e) => sum + (e.totalHours || 0), 0),
      uniqueWorkers: [...new Set(entries.map((e) => e.worker._id.toString()))]
        .length,
    };

    const result = {
      project: {
        _id: project._id,
        name: project.name,
      },
      entries: groupedEntries,
      stats,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching project diary:", error);
    return NextResponse.json(
      { error: "Failed to fetch project diary" },
      { status: 500 }
    );
  }
}
