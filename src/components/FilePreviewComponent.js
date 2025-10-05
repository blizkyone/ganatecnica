"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteFileFromS3 } from "@/actions/uploadS3";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/Message";

export function FilePreviewComponent({
  filesData,
  filesLoading,
  filesError,
  folderId,
  onFilesRefetch,
  onError,
}) {
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDocuments, setShowDocuments] = useState(true);

  const handleFileClick = async (fileKey) => {
    try {
      const response = await fetch(
        `/api/s3/get-one-file?key=${encodeURIComponent(fileKey)}`
      );
      const data = await response.json();

      if (data.signedUrl) {
        setPreviewFile(fileKey);
        setPreviewUrl(data.signedUrl);
      }
    } catch (error) {
      console.error("Error getting file URL:", error);
      onError?.("Error loading file preview");
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toLowerCase();
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    return imageExtensions.includes(getFileExtension(fileName));
  };

  const isPdfFile = (fileName) => {
    return getFileExtension(fileName) === "pdf";
  };

  const handleDeleteFile = async (fileKey) => {
    const fileName = fileKey.replace(`${folderId}/`, "");

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el archivo "${fileName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      const result = await deleteFileFromS3({ key: fileKey });

      if (result.error) {
        onError?.(`Error al eliminar el archivo: ${result.error}`);
      } else {
        // Refetch the files list to update the UI
        await onFilesRefetch?.();
        console.log(`File deleted successfully: ${fileName}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      onError?.(`Error al eliminar el archivo: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="mb-4">
        <Button
          onClick={() => setShowDocuments(!showDocuments)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <span>{showDocuments ? "📁" : "📂"}</span>
          {showDocuments ? "Ocultar Documentos" : "Mostrar Documentos"}
          {filesData && Array.isArray(filesData) && filesData.length > 0 && (
            <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {filesData.length}
            </span>
          )}
        </Button>
      </div>

      {/* File List */}
      {showDocuments && (
        <div className="space-y-2">
          {filesLoading && <Loading />}
          {filesError && <ErrorMessage error={filesError} />}
          {filesData && Array.isArray(filesData) && filesData.length > 0
            ? filesData.map((file) => {
                const fileName = file.replace(`${folderId}/`, "");
                return (
                  <div
                    key={file}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleFileClick(file)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left flex-1"
                      >
                        <span className="flex items-center">
                          {isImageFile(fileName) && (
                            <span className="mr-2">🖼️</span>
                          )}
                          {isPdfFile(fileName) && (
                            <span className="mr-2">📄</span>
                          )}
                          {!isImageFile(fileName) && !isPdfFile(fileName) && (
                            <span className="mr-2">📎</span>
                          )}
                          {fileName}
                        </span>
                      </button>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileClick(file)}
                          className="text-xs"
                        >
                          Preview
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFile(file)}
                          className="text-xs"
                          disabled={isDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            : filesData &&
              Array.isArray(filesData) &&
              filesData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay archivos subidos aún</p>
                </div>
              )}
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {previewFile.replace(`${folderId}/`, "")}
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleDownload(
                      previewUrl,
                      previewFile.replace(`${folderId}/`, "")
                    )
                  }
                  variant="outline"
                  size="sm"
                >
                  Download
                </Button>
                <Button onClick={closePreview} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              {isImageFile(previewFile) ? (
                <img
                  src={previewUrl}
                  alt={previewFile.replace(`${folderId}/`, "")}
                  className="max-w-full h-auto mx-auto"
                />
              ) : isPdfFile(previewFile) ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh]"
                  title={previewFile.replace(`${folderId}/`, "")}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <Button
                    onClick={() =>
                      handleDownload(
                        previewUrl,
                        previewFile.replace(`${folderId}/`, "")
                      )
                    }
                    variant="outline"
                  >
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
