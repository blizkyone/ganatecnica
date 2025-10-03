import { s3Client } from "@/lib/s3";
import { ListObjectsCommand } from "@aws-sdk/client-s3";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");

    const command = new ListObjectsCommand({
      Bucket: folder,
      Prefix: "test/",
    });

    const response = await s3Client.send(command);

    const files = response.Contents.map((item) => item.Key);

    console.log(response.Contents);

    return Response.json({ files }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
