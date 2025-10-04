import Personal from "@/models/personalModel";
import connectDB from "@/database";

export async function GET(req) {
  try {
    await connectDB();

    const personal = await Personal.find().lean();

    console.log(personal);

    return Response.json(personal, { status: 200 });
  } catch (error) {
    console.error("Error fetching personal:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
