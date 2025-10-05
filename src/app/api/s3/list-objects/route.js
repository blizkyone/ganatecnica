import { s3Client } from "@/lib/s3";
import { ListObjectsCommand } from "@aws-sdk/client-s3";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");

    const command = new ListObjectsCommand({
      Bucket: "ganatecnica",
      Prefix: `${folder}/`,
    });

    const response = await s3Client.send(command);

    // Handle case where folder doesn't exist or is empty
    const files = response.Contents
      ? response.Contents.map((item) => item.Key)
      : [];

    // console.log(`Files in folder '${folder}':`, files);

    return Response.json(files, { status: 200 });
  } catch (error) {
    console.error(`Error listing objects in folder '${folder}':`, error);
    // Return empty array instead of error to prevent client-side issues
    return Response.json([], { status: 200 });
  }
}
