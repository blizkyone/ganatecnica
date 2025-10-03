import { axiosBunny } from "@/lib/axios";

export async function GET(req) {
  try {
    const { data } = await axiosBunny.get("/20180623_090650.jpg");
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
