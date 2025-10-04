"use server";
import { s3Client } from "@/lib/s3";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import {
  compressPDFServerSide,
  compressPDFAggressive,
} from "@/lib/pdfCompression";

export async function uploadFileToS3({ file, key }) {
  try {
    // Convert File to Buffer
    let buffer = Buffer.from(await file.arrayBuffer());
    let compressionInfo = null;
    let finalContentLength = file.size;

    // Apply server-side PDF compression if file is PDF (handle up to 6MB PDFs)
    if (file.type === "application/pdf") {
      // Allow PDFs up to 6MB to reach the server
      const maxPDFSizeInBytes = 6 * 1024 * 1024;
      if (file.size > maxPDFSizeInBytes) {
        return {
          error: `PDF file is too large (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB). Maximum PDF size is 6MB.`,
        };
      }

      // Compress PDFs larger than 3MB, targeting 3MB but allowing up to 6MB
      if (file.size > 3 * 1024 * 1024) {
        console.log("Applying server-side PDF compression...");

        // Try standard compression first, targeting 3MB
        let compressionResult = await compressPDFServerSide(buffer, 3);

        // If still too large, try aggressive compression targeting 3MB
        if (compressionResult.compressedSize > 3 * 1024 * 1024) {
          console.log(
            "Standard compression insufficient, trying aggressive compression..."
          );
          compressionResult = await compressPDFAggressive(buffer, 3);
        }

        if (compressionResult.wasCompressed) {
          buffer = compressionResult.buffer;
          finalContentLength = compressionResult.compressedSize;
          compressionInfo = {
            wasCompressed: true,
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: (
              ((compressionResult.originalSize -
                compressionResult.compressedSize) /
                compressionResult.originalSize) *
              100
            ).toFixed(1),
          };
          console.log(
            `Server-side PDF compression: ${compressionInfo.compressionRatio}% reduction`
          );
        } else if (compressionResult.error) {
          console.warn(
            "PDF compression failed, uploading original:",
            compressionResult.error
          );
        }

        // Final check - if still over 6MB after compression, reject
        if (finalContentLength > 6 * 1024 * 1024) {
          return {
            error: `PDF file is too large even after compression. Final size: ${(
              finalContentLength /
              1024 /
              1024
            ).toFixed(
              2
            )}MB. Please use a smaller PDF or compress it externally.`,
          };
        }
      }
    } else {
      // For non-PDF files, apply strict 3MB limit
      const maxSizeInBytes = 3 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return {
          error: `File size exceeds the 3MB limit. File size: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB`,
        };
      }
    }

    const command = new PutObjectCommand({
      Bucket: "ganatecnica",
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: finalContentLength,
    });

    const response = await s3Client.send(command);

    // console.log(response);

    return {
      message: "File uploaded successfully",
      etag: response.ETag,
      compressionInfo,
    };
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
}

export async function deleteFileFromS3({ key }) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: "ganatecnica",
      Key: key,
    });

    const response = await s3Client.send(command);

    console.log(`File deleted successfully: ${key}`);

    return {
      message: "File deleted successfully",
      key: key,
    };
  } catch (error) {
    console.error(`Error deleting file ${key}:`, error);
    return {
      error: error.message,
      key: key,
    };
  }
}
