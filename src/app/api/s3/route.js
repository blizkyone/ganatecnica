import { s3Client } from "@/lib/s3";
import {
  S3ServiceException,
  // This command supersedes the ListObjectsCommand and is the recommended way to list objects.
  paginateListObjectsV2,
} from "@aws-sdk/client-s3";

export async function GET(req) {
  const objects = [];
  try {
    const paginator = paginateListObjectsV2(
      { client: s3Client, pageSize: 2 },
      { Bucket: "ganatecnica" }
    );

    for await (const page of paginator) {
      objects.push(page.Contents.map((o) => o.Key));
    }
    objects.forEach((objectList, pageNum) => {
      console.log(
        `Page ${pageNum + 1}\n------\n${objectList
          .map((o) => `• ${o}`)
          .join("\n")}\n`
      );
    });
    return Response.json({ objects }, { status: 200 });
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "NoSuchBucket"
    ) {
      const errorMessage = `Error from S3 while listing objects for "${bucketName}". The bucket doesn't exist.`;
      console.error(errorMessage);
      return Response.json({ error: errorMessage }, { status: 400 });
    } else if (caught instanceof S3ServiceException) {
      const errorMessage = `Error from S3 while listing objects for "${bucketName}".  ${caught.name}: ${caught.message}`;

      console.error(errorMessage);
      return Response.json({ error: errorMessage }, { status: 400 });
    } else {
      return Response.json({ error: caught.message }, { status: 400 });
    }
  }
}
