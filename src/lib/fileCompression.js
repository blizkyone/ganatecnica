import imageCompression from "browser-image-compression";

/**
 * Compresses a file if it exceeds the specified size limit
 * @param {File} file - The file to potentially compress
 * @param {number} maxSizeInMB - Maximum size in MB (default: 3)
 * @returns {Promise<{file: File, wasCompressed: boolean, originalSize: number, compressedSize: number}>}
 */
export async function compressFileIfNeeded(file, maxSizeInMB = 3) {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Check file type first
  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  // Handle PDFs separately - allow up to 6MB, no client-side compression
  if (isPDF) {
    const maxPDFSizeInBytes = 6 * 1024 * 1024; // 6MB for PDFs

    if (file.size > maxPDFSizeInBytes) {
      throw new Error(
        `PDF file is too large (${(file.size / 1024 / 1024).toFixed(
          2
        )}MB). Maximum PDF size is 6MB. Please compress the PDF externally.`
      );
    }

    // Always pass PDFs through to server, regardless of size
    console.log(`PDF file will be processed server-side: ${file.name}`);
    return {
      file,
      wasCompressed: false,
      originalSize: file.size,
      compressedSize: file.size,
      serverSideCompression: file.size > maxSizeInBytes, // Flag if server needs to compress
    };
  }

  // Handle images - apply 3MB limit and client-side compression
  if (isImage) {
    if (file.size <= maxSizeInBytes) {
      return {
        file,
        wasCompressed: false,
        originalSize: file.size,
        compressedSize: file.size,
      };
    }

    // Compress images over 3MB client-side
    try {
      const options = {
        maxSizeMB: maxSizeInMB,
        maxWidthOrHeight: 1920, // Resize large images
        useWebWorker: true,
        fileType: file.type,
        initialQuality: 0.8,
      };

      console.log(
        `Compressing image client-side: ${file.name} (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );

      const compressedFile = await imageCompression(file, options);

      console.log(
        `Compression complete: ${(compressedFile.size / 1024 / 1024).toFixed(
          2
        )}MB`
      );

      return {
        file: compressedFile,
        wasCompressed: true,
        originalSize: file.size,
        compressedSize: compressedFile.size,
      };
    } catch (error) {
      console.error("Image compression failed:", error);
      throw new Error(`Failed to compress image: ${error.message}`);
    }
  }

  // For other file types, reject if over 3MB limit
  if (file.size > maxSizeInBytes) {
    throw new Error(
      `File is too large (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB). Only images and PDFs can be compressed automatically. Please upload a file smaller than ${maxSizeInMB}MB.`
    );
  }

  // Other files under 3MB
  return {
    file,
    wasCompressed: false,
    originalSize: file.size,
    compressedSize: file.size,
  };
}

/**
 * Formats file size in human readable format
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
