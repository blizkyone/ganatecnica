import { FilePondComponent } from "@/components/FilePondComponent";
import { uploadFileToS3 } from "@/actions/uploadS3";
import { compressFileIfNeeded, formatFileSize } from "@/lib/fileCompression";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Loading from "./Loading";

export function UploadFileComponent({ folder }) {
  const [files, setFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);

  const uploadFile = async () => {
    if (files.length === 0) return;
    setUploadLoading(true);
    setCompressionInfo(null);

    try {
      const originalFile = files[0].file;

      // Compress file if needed (images client-side, PDFs server-side)
      const compressionResult = await compressFileIfNeeded(originalFile, 3);
      const {
        file,
        wasCompressed,
        originalSize,
        compressedSize,
        serverSideCompression,
      } = compressionResult;

      if (wasCompressed) {
        setCompressionInfo({
          wasCompressed: true,
          originalSize: formatFileSize(originalSize),
          compressedSize: formatFileSize(compressedSize),
          compressionRatio: (
            ((originalSize - compressedSize) / originalSize) *
            100
          ).toFixed(1),
          type: "client-side",
        });
      } else if (serverSideCompression) {
        setCompressionInfo({
          serverSideProcessing: true,
          type: "server-side",
        });
      }

      const key = `test/${file.name}`;
      const result = await uploadFileToS3({ file, key });
      console.log("Upload Result:", result);

      // Handle server-side compression info from upload result
      if (result.compressionInfo && result.compressionInfo.wasCompressed) {
        setCompressionInfo({
          wasCompressed: true,
          originalSize: formatFileSize(result.compressionInfo.originalSize),
          compressedSize: formatFileSize(result.compressionInfo.compressedSize),
          compressionRatio: result.compressionInfo.compressionRatio,
          type: "server-side",
        });
      }

      if (result.error) {
        console.error("Upload error:", result.error);
        setCompressionInfo({ error: result.error });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setCompressionInfo({ error: error.message });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div>
      <FilePondComponent
        className="h-96 w-96"
        files={files}
        setFiles={setFiles}
      />

      {/* File size info */}
      {files.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected file: <strong>{files[0].file.name}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Type: <strong>{files[0].file.type || "Unknown"}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Size: <strong>{formatFileSize(files[0].file.size)}</strong>
          </p>
          {/* Show different warnings based on file type and size */}
          {files[0].file.type?.startsWith("image/") &&
            files[0].file.size > 3 * 1024 * 1024 && (
              <p className="text-sm text-orange-600">
                ⚠️ Image exceeds 3MB - will be compressed client-side before
                upload
              </p>
            )}
          {files[0].file.type === "application/pdf" &&
            files[0].file.size > 3 * 1024 * 1024 &&
            files[0].file.size <= 6 * 1024 * 1024 && (
              <p className="text-sm text-orange-600">
                ⚠️ PDF exceeds 3MB - will be compressed server-side (target:
                3MB, max allowed: 6MB)
              </p>
            )}
          {files[0].file.type === "application/pdf" &&
            files[0].file.size > 6 * 1024 * 1024 && (
              <p className="text-sm text-red-600">
                ❌ PDF exceeds 6MB limit - please compress externally first
              </p>
            )}
          {!files[0].file.type?.startsWith("image/") &&
            files[0].file.type !== "application/pdf" &&
            files[0].file.size > 3 * 1024 * 1024 && (
              <p className="text-sm text-red-600">
                ❌ File type not supported for compression - 3MB limit applies
              </p>
            )}
        </div>
      )}

      {/* Compression info */}
      {compressionInfo && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {compressionInfo.error ? (
            <p className="text-red-600">❌ {compressionInfo.error}</p>
          ) : compressionInfo.serverSideProcessing ? (
            <div className="text-blue-800">
              <p className="font-semibold">
                🔄 PDF will be compressed on server...
              </p>
              <p className="text-sm">
                Server-side compression will be applied during upload
              </p>
            </div>
          ) : compressionInfo.wasCompressed ? (
            <div className="text-blue-800">
              <p className="font-semibold">✅ File compressed successfully!</p>
              <p className="text-sm">
                Method: <strong>{compressionInfo.type || "unknown"}</strong>
              </p>
              <p className="text-sm">
                Original size: {compressionInfo.originalSize}
              </p>
              <p className="text-sm">
                Compressed size: {compressionInfo.compressedSize}
              </p>
              <p className="text-sm">
                Reduced by: {compressionInfo.compressionRatio}%
              </p>
            </div>
          ) : (
            <p className="text-green-600">
              ✅ File uploaded without compression (already under 3MB)
            </p>
          )}
        </div>
      )}

      {files.length > 0 && (
        <Button onClick={uploadFile} disabled={uploadLoading} className="mt-4">
          {uploadLoading ? <Loading /> : "Upload to S3"}
        </Button>
      )}
    </div>
  );
}
