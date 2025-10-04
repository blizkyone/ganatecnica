import connectDB from "@/database";
import Personal from "@/models/personalModel";

export const GET = async (req, { params }) => {
  const { id } = await params;

  try {
    await connectDB();

    const personal = await Personal.findById(id);

    if (!personal) {
      return Response.json({ error: "Personal not found" }, { status: 404 });
    }

    return Response.json(personal, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
};

export const PUT = async (req, { params }) => {
  const { id } = await params;

  try {
    await connectDB();

    const data = await req.json();

    const personal = await Personal.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!personal) {
      return Response.json({ error: "Personal not found" }, { status: 404 });
    }

    return Response.json(personal, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
};
