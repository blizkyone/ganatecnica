import { NextResponse } from "next/server";
import DiaryEntry from "@/models/diaryEntryModel";
import Personal from "@/models/personalModel";
import Proyecto from "@/models/projectModel";
import connectDB from "@/database";

// GET /api/diary - Get diary entries with filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project");
    const workerId = searchParams.get("worker");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = {};

    // Filter by project
    if (projectId) {
      query.project = projectId;
    }

    // Filter by worker
    if (workerId) {
      query.worker = workerId;
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

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch diary entries" },
      { status: 500 }
    );
  }
}

// POST /api/diary - Create new diary entry (clock-in)
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const { projectId, workerId, startTime, endTime, notes, isMaestro } = data;

    if (!projectId || !workerId) {
      return NextResponse.json(
        { error: "Project ID and Worker ID are required" },
        { status: 400 }
      );
    }

    // Verify project and worker exist, and populate project with personalRoles
    const [project, worker] = await Promise.all([
      Proyecto.findById(projectId).populate(
        "personalRoles.personalId personalRoles.roleId"
      ),
      Personal.findById(workerId),
    ]);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Find the worker's role in this project
    let workerRole = null;
    let roleSnapshot = null;

    const personalRole = project.personalRoles?.find(
      (pr) =>
        pr.personalId?._id?.toString() === workerId ||
        pr.personalId?.toString() === workerId
    );

    if (personalRole && personalRole.roleId) {
      workerRole = personalRole.roleId._id || personalRole.roleId;
      // Create role snapshot for historical accuracy
      const roleData = personalRole.roleId._id ? personalRole.roleId : null;
      if (roleData) {
        roleSnapshot = {
          name: roleData.name,
          description: roleData.description,
          color: roleData.color,
        };
      }
    }

    const today = DiaryEntry.getTodayDate();
    const clockInTime = startTime ? new Date(startTime) : new Date();
    const clockOutTime = endTime ? new Date(endTime) : null;

    // Validate that end time is after start time if both are provided
    if (clockOutTime && clockOutTime <= clockInTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Extract date from the provided startTime, or use today as fallback
    const entryDate = startTime
      ? DiaryEntry.formatDate(new Date(startTime))
      : today;

    // Check if worker already has an entry for the specified date
    const existingEntry = await DiaryEntry.findOne({
      project: projectId,
      worker: workerId,
      date: entryDate,
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Worker already has an entry for this date" },
        { status: 400 }
      );
    }

    // Create new diary entry
    const diaryEntryData = {
      project: projectId,
      worker: workerId,
      date: entryDate,
      startTime: clockInTime,
      notes,
      isMaestro: isMaestro || false,
      role: workerRole,
      roleSnapshot: roleSnapshot,
    };

    // Add end time if provided
    if (clockOutTime) {
      diaryEntryData.endTime = clockOutTime;
    }

    const diaryEntry = new DiaryEntry(diaryEntryData);

    await diaryEntry.save();

    // Populate the response
    await diaryEntry.populate("worker", "name email");
    await diaryEntry.populate("project", "name");

    return NextResponse.json(diaryEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating diary entry:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Diary entry already exists for this worker and date" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create diary entry" },
      { status: 500 }
    );
  }
}
