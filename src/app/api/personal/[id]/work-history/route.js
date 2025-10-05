import { NextResponse } from "next/server";
import DiaryEntry from "@/models/diaryEntryModel";
import connectDB from "@/database";

// GET /api/personal/[id]/work-history - Get personal's work history from diary entries
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id: personalId } = await params;

    if (!personalId) {
      return NextResponse.json(
        { error: "Personal ID is required" },
        { status: 400 }
      );
    }

    // Get all diary entries for this personal
    const entries = await DiaryEntry.find({ worker: personalId })
      .populate("project", "name")
      .populate("worker", "name email")
      .sort({ date: -1 });

    if (entries.length === 0) {
      return NextResponse.json({
        workHistory: [],
        summary: {
          totalProjects: 0,
          totalDaysWorked: 0,
          totalHours: 0,
        },
      });
    }

    // Group entries by project to get work history
    const projectsMap = new Map();

    for (const entry of entries) {
      const projectId = entry.project._id.toString();

      if (!projectsMap.has(projectId)) {
        projectsMap.set(projectId, {
          project: entry.project,
          entries: [],
          totalHours: 0,
          totalDays: 0,
          firstDate: entry.date,
          lastDate: entry.date,
          wasMaestro: entry.isMaestro,
        });
      }

      const projectData = projectsMap.get(projectId);
      projectData.entries.push(entry);
      projectData.totalHours += entry.totalHours || 0;
      projectData.totalDays += 1;

      // Update date range
      if (entry.date > projectData.lastDate) {
        projectData.lastDate = entry.date;
      }
      if (entry.date < projectData.firstDate) {
        projectData.firstDate = entry.date;
      }

      // Check if was maestro on any day
      if (entry.isMaestro) {
        projectData.wasMaestro = true;
      }
    }

    // Convert map to array and get maestro information for projects where personal was not maestro
    const workHistory = [];

    for (const [projectId, projectData] of projectsMap) {
      let maestroInfo = null;

      // If personal was not maestro, find who was the maestro on this project
      if (!projectData.wasMaestro) {
        // Find all maestro entries for this project (not limited by date range)
        // since maestros might work on different days than regular workers
        const maestroEntries = await DiaryEntry.find({
          project: projectId,
          isMaestro: true,
        }).populate("worker", "name email");

        if (maestroEntries.length > 0) {
          // Get unique maestros (in case there were multiple)
          const uniqueMaestros = [];
          const seenMaestroIds = new Set();

          for (const entry of maestroEntries) {
            if (
              entry.worker &&
              !seenMaestroIds.has(entry.worker._id.toString())
            ) {
              seenMaestroIds.add(entry.worker._id.toString());
              uniqueMaestros.push(entry.worker);
            }
          }

          maestroInfo = uniqueMaestros;
        }
      }

      workHistory.push({
        project: projectData.project,
        totalHours: projectData.totalHours,
        totalDays: projectData.totalDays,
        dateRange: {
          start: projectData.firstDate,
          end: projectData.lastDate,
        },
        wasMaestro: projectData.wasMaestro,
        maestros: maestroInfo,
      });
    }

    // Sort by last date worked (most recent first)
    workHistory.sort(
      (a, b) => new Date(b.dateRange.end) - new Date(a.dateRange.end)
    );

    // Calculate summary statistics
    const summary = {
      totalProjects: workHistory.length,
      totalDaysWorked: entries.length,
      totalHours: entries.reduce(
        (sum, entry) => sum + (entry.totalHours || 0),
        0
      ),
    };

    return NextResponse.json({
      workHistory,
      summary,
    });
  } catch (error) {
    console.error("Error fetching personal work history:", error);
    return NextResponse.json(
      { error: "Failed to fetch work history" },
      { status: 500 }
    );
  }
}
