import connectDB from "@/database";
import Proyecto from "@/models/projectModel";
import Role from "@/models/roleModel"; // Import Role model for population
import Personal from "@/models/personalModel"; // Import Personal model for population

export const GET = async (req, { params }) => {
  const { id } = await params;

  try {
    await connectDB();

    let proyecto = await Proyecto.findById(id).populate(
      "encargado",
      "name email phone"
    );

    // Manually populate personalRoles
    if (
      proyecto &&
      proyecto.personalRoles &&
      proyecto.personalRoles.length > 0
    ) {
      await proyecto.populate([
        {
          path: "personalRoles.personalId",
          select: "name email phone",
        },
        {
          path: "personalRoles.roleId",
          select: "name description color",
        },
      ]);
    }

    if (!proyecto) {
      return Response.json({ error: "Proyecto not found" }, { status: 404 });
    }

    return Response.json(proyecto, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/proyectos/[id]:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
};

export const PUT = async (req, { params }) => {
  const { id } = await params;

  try {
    await connectDB();

    const data = await req.json();

    let proyecto = await Proyecto.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("encargado", "name email phone");

    // Manually populate personalRoles
    if (
      proyecto &&
      proyecto.personalRoles &&
      proyecto.personalRoles.length > 0
    ) {
      await proyecto.populate([
        {
          path: "personalRoles.personalId",
          select: "name email phone",
        },
        {
          path: "personalRoles.roleId",
          select: "name description color",
        },
      ]);
    }

    if (!proyecto) {
      return Response.json({ error: "Proyecto not found" }, { status: 404 });
    }

    return Response.json(proyecto, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
};
