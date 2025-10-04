import connectDB from "@/database";
import Proyecto from "@/models/projectModel";

export const GET = async (req, { params }) => {
  const { id } = await params;

  try {
    await connectDB();

    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      return Response.json({ error: "Proyecto not found" }, { status: 404 });
    }

    return Response.json(proyecto, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
};

export const PUT = async (req, { params }) => {
  const { id } = await params;

  try {
    await connectDB();

    const data = await req.json();

    const proyecto = await Proyecto.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!proyecto) {
      return Response.json({ error: "Proyecto not found" }, { status: 404 });
    }

    return Response.json(proyecto, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
};
