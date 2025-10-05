import Proyecto from "@/models/projectModel";
import connectDB from "@/database";

export async function GET(req) {
  try {
    await connectDB();

    const proyectos = await Proyecto.find({
      finalized: { $exists: false },
      active: true,
    }).lean();

    return Response.json(proyectos, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
