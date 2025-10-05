import Personal from "@/models/personalModel";
import Project from "@/models/projectModel";
import connectDB from "@/database";

export async function GET(req) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const includeAvailability =
      searchParams.get("includeAvailability") === "true";
    const includeRoles = searchParams.get("includeRoles") === "true";

    // Build query and populate based on parameters
    let query = Personal.find();

    if (includeRoles) {
      query = query.populate("roles.roleId", "name description color");
    }

    if (!includeAvailability && !includeRoles) {
      // Original behavior - just return personal data
      const personal = await query.lean();
      return Response.json(personal, { status: 200 });
    }

    // Get personal data
    const personal = await query.lean();

    if (!includeAvailability) {
      // Just roles, no availability calculation needed
      return Response.json(personal, { status: 200 });
    }

    // Enhanced behavior - include availability data
    // Get all active projects that are not finalized
    const activeProjects = await Project.find({
      active: true,
      $or: [{ finalized: { $exists: false } }, { finalized: null }],
    }).lean();

    // Calculate availability for each personal
    const personalWithAvailability = personal.map((person) => {
      const personId = person._id.toString();

      // Find projects where this person is assigned
      const assignedProjects = activeProjects.filter(
        (project) =>
          project.personalRoles?.some(
            (role) => role.personalId?.toString() === personId
          ) || project.encargado?.toString() === personId
      );

      // Determine availability status
      let availability;
      if (!person.active) {
        availability = {
          status: "inactive",
          color: "red",
          label: "Inactivo",
          projectCount: 0,
        };
      } else if (assignedProjects.length > 0) {
        availability = {
          status: "assigned",
          color: "green",
          label: "Asignado a Proyecto",
          projectCount: assignedProjects.length,
        };
      } else {
        availability = {
          status: "available",
          color: "gray",
          label: "Disponible",
          projectCount: 0,
        };
      }

      return {
        ...person,
        availability,
      };
    });

    return Response.json(personalWithAvailability, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
