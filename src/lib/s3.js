import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "us-east-1",
  // credentials are automatically picked up from environment variables:
  // AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
});
