import dbConnect from "@/database";
import Project from "@/models/projectModel";

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { finalizedDate } = await request.json();

    // Validate the project ID
    if (!id) {
      return Response.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Validate the finalized date
    if (!finalizedDate) {
      return Response.json(
        { error: "Finalized date is required" },
        { status: 400 }
      );
    }

    // Validate date format
    const date = new Date(finalizedDate);
    if (isNaN(date.getTime())) {
      return Response.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Find and update the project
    const project = await Project.findById(id);

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if project is already finalized
    if (project.finalized) {
      return Response.json(
        {
          error: "Project is already finalized",
          finalizedDate: project.finalized,
        },
        { status: 400 }
      );
    }

    // Update the project with finalized date and set active to false
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        finalized: date,
        active: false, // Automatically set project as inactive when finalized
      },
      { new: true, runValidators: true }
    ).populate("personalRoles.personalId personalRoles.roleId encargado");

    return Response.json(
      {
        message: "Project finalized successfully",
        project: updatedProject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finalizing project:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
