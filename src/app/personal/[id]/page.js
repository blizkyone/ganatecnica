"use client";
import { UploadFileComponent } from "@/components/UploadFileComponent";
import { deleteFileFromS3 } from "@/actions/uploadS3";
import { useState } from "react";
import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/Message";

export const Page = () => {
  const [show, setShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    socialSecurityNumber: "",
    ine: "",
    rfc: "",
  });
  const { id } = useParams();

  const {
    data,
    error: queryError,
    isLoading: queryLoading,
    refetch,
  } = useQuery({
    queryKey: ["personalDetail", id],
    queryFn: () => fetch(`/api/personal/${id}`).then((res) => res.json()),
    enabled: !!id, // only run the query if id is available
    onSuccess: (data) => {
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        socialSecurityNumber: data.socialSecurityNumber || "",
        ine: data.ine || "",
        rfc: data.rfc || "",
      });
    },
  });

  const {
    data: filesData,
    refetch: filesRefetch,
    error: filesError,
    loading: filesLoading,
  } = useQuery({
    queryKey: ["listFiles", id],
    queryFn: () =>
      fetch(`/api/s3/list-objects?folder=${id}`).then((res) => res.json()),
  });

  // Update form data when data changes
  React.useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        socialSecurityNumber: data.socialSecurityNumber || "",
        ine: data.ine || "",
        rfc: data.rfc || "",
      });
    }
  }, [data]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset form data to original values
    if (data) {
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        socialSecurityNumber: data.socialSecurityNumber || "",
        ine: data.ine || "",
        rfc: data.rfc || "",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      setError("Error loading file preview");
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
    const fileName = fileKey.replace(`${id}/`, "");

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el archivo "${fileName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await deleteFileFromS3({ key: fileKey });

      if (result.error) {
        setError(`Error al eliminar el archivo: ${result.error}`);
      } else {
        // Refetch the files list to update the UI
        await filesRefetch();
        console.log(`File deleted successfully: ${fileName}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setError(`Error al eliminar el archivo: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/personal/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating personal data");
      }

      setIsEditing(false);
      refetch(); // Refetch the data
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-6 p-4 min-h-screen">
      {queryLoading && <Loading />}
      {queryError && <ErrorMessage error={queryError} />}

      {data && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{data.name}</h1>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                Editar Información
              </Button>
            )}
          </div>

          {/* Personal Information Section */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Número de teléfono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Correo electrónico"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Seguro Social
                    </label>
                    <Input
                      type="text"
                      value={formData.socialSecurityNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "socialSecurityNumber",
                          e.target.value
                        )
                      }
                      placeholder="Número de seguro social"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      INE
                    </label>
                    <Input
                      type="text"
                      value={formData.ine}
                      onChange={(e) => handleInputChange("ine", e.target.value)}
                      placeholder="Clave de elector (INE)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFC
                  </label>
                  <Input
                    type="text"
                    value={formData.rfc}
                    onChange={(e) => handleInputChange("rfc", e.target.value)}
                    placeholder="RFC"
                    className="w-full md:w-1/2"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? <Loading /> : "Guardar Cambios"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <p className="text-gray-900">{data.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Teléfono:</span>
                    <p className="text-gray-900">
                      {data.phone || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">
                      {data.email || "No especificado"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">
                      Número de Seguro Social:
                    </span>
                    <p className="text-gray-900">
                      {data.socialSecurityNumber || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">INE:</span>
                    <p className="text-gray-900">
                      {data.ine || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">RFC:</span>
                    <p className="text-gray-900">
                      {data.rfc || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* File Upload Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Documentos</h2>

        <Button onClick={() => setShow(true)} variant="outline">
          Subir Archivo
        </Button>

        {filesLoading && <Loading />}
        {filesError && <ErrorMessage error={filesError} />}
        {filesData &&
          filesData.map((file) => {
            const fileName = file.replace(`${id}/`, "");
            return (
              <div
                key={file}
                className="mt-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                      {isPdfFile(fileName) && <span className="mr-2">📄</span>}
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
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {show && (
        <UploadFileComponent
          folder={id}
          setShow={setShow}
          refetch={filesRefetch}
        />
      )}

      {/* File Preview Modal */}
      {previewFile && previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {previewFile.replace(`${id}/`, "")}
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleDownload(
                      previewUrl,
                      previewFile.replace(`${id}/`, "")
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
                  alt={previewFile.replace(`${id}/`, "")}
                  className="max-w-full h-auto mx-auto"
                />
              ) : isPdfFile(previewFile) ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh]"
                  title={previewFile.replace(`${id}/`, "")}
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
                        previewFile.replace(`${id}/`, "")
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
    </div>
  );
};

export default Page;
