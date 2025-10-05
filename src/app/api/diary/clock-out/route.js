import { NextResponse } from "next/server";
import DiaryEntry from "@/models/diaryEntryModel";
import connectDB from "@/database";

// PUT /api/diary/clock-out - Clock out worker
export async function PUT(request) {
  try {
    await connectDB();

    const data = await request.json();
    const { projectId, workerId, endTime, notes } = data;

    if (!projectId || !workerId) {
      return NextResponse.json(
        { error: "Project ID and Worker ID are required" },
        { status: 400 }
      );
    }

    const today = DiaryEntry.getTodayDate();
    const clockOutTime = endTime ? new Date(endTime) : new Date();

    // Extract date from the provided endTime, or use today as fallback
    const entryDate = endTime
      ? DiaryEntry.formatDate(new Date(endTime))
      : today;

    // Find the active entry for this worker on the specified date
    const diaryEntry = await DiaryEntry.findOne({
      project: projectId,
      worker: workerId,
      date: entryDate,
      status: "active",
    });

    if (!diaryEntry) {
      return NextResponse.json(
        { error: "No active diary entry found for this date" },
        { status: 404 }
      );
    }

    if (diaryEntry.endTime) {
      return NextResponse.json(
        { error: "Worker already clocked out for this date" },
        { status: 400 }
      );
    }

    // Validate that end time is after start time
    if (clockOutTime <= diaryEntry.startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Update the entry
    diaryEntry.endTime = clockOutTime;
    if (notes) {
      diaryEntry.notes = notes;
    }

    await diaryEntry.save();

    // Populate the response
    await diaryEntry.populate("worker", "name email");
    await diaryEntry.populate("project", "name");

    return NextResponse.json(diaryEntry);
  } catch (error) {
    console.error("Error clocking out:", error);
    return NextResponse.json({ error: "Failed to clock out" }, { status: 500 });
  }
}
