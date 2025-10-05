import { NextResponse } from "next/server";
import DiaryEntry from "@/models/diaryEntryModel";
import connectDB from "@/database";

// GET /api/diary/[id] - Get specific diary entry
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const entry = await DiaryEntry.findById(id)
      .populate("worker", "name email")
      .populate("project", "name");

    if (!entry) {
      return NextResponse.json(
        { error: "Diary entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching diary entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch diary entry" },
      { status: 500 }
    );
  }
}

// PUT /api/diary/[id] - Update diary entry
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();

    const { startTime, endTime, notes, status } = data;

    if (!startTime) {
      return NextResponse.json(
        { error: "Start time is required" },
        { status: 400 }
      );
    }

    // Find the existing entry
    const existingEntry = await DiaryEntry.findById(id);
    if (!existingEntry) {
      return NextResponse.json(
        { error: "Diary entry not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      startTime: new Date(startTime),
      notes: notes || "",
    };

    // Handle end time and status
    if (endTime) {
      updateData.endTime = new Date(endTime);
      updateData.status = "completed";
    } else {
      updateData.endTime = null;
      updateData.status = "active";
    }

    // Validate that end time is after start time
    if (updateData.endTime && updateData.endTime <= updateData.startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Update the entry
    const updatedEntry = await DiaryEntry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // The pre-save hook will automatically calculate totalHours

    // Populate the response
    await updatedEntry.populate("worker", "name email");
    await updatedEntry.populate("project", "name");

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating diary entry:", error);
    return NextResponse.json(
      { error: "Failed to update diary entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/diary/[id] - Delete diary entry
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedEntry = await DiaryEntry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return NextResponse.json(
        { error: "Diary entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    return NextResponse.json(
      { error: "Failed to delete diary entry" },
      { status: 500 }
    );
  }
}
