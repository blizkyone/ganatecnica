"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadFileComponent } from "@/components/UploadFileComponent";
import { FilePreviewComponent } from "@/components/FilePreviewComponent";

export function ProjectDocuments({
  filesData,
  filesLoading,
  filesError,
  projectId,
  onFilesRefetch,
  onError,
}) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Documentos del Proyecto</h2>

      {!showUpload && (
        <Button onClick={() => setShowUpload(true)} variant="outline">
          Subir Archivo
        </Button>
      )}

      <FilePreviewComponent
        filesData={filesData}
        filesLoading={filesLoading}
        filesError={filesError}
        folderId={projectId}
        onFilesRefetch={onFilesRefetch}
        onError={onError || (() => {})}
      />

      {showUpload && (
        <UploadFileComponent
          folder={projectId}
          setShow={setShowUpload}
          refetch={onFilesRefetch}
        />
      )}
    </div>
  );
}
