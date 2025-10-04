"use client";
import { UploadFileComponent } from "@/components/UploadFileComponent";
import { FilePreviewComponent } from "@/components/FilePreviewComponent";
import { CustomBreadcrumbs } from "@/components/CustomBreadcrumbs";
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
  const [formData, setFormData] = useState({
    name: "",
    customer_name: "",
    address: "",
    email: "",
    phone: "",
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  });
  const { id } = useParams();

  const {
    data,
    error: queryError,
    isLoading: queryLoading,
    refetch,
  } = useQuery({
    queryKey: ["projectDetail", id],
    queryFn: () => fetch(`/api/proyectos/${id}`).then((res) => res.json()),
    enabled: !!id, // only run the query if id is available
    onSuccess: (data) => {
      setFormData({
        name: data.name || "",
        customer_name: data.customer_name || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || { type: "Point", coordinates: [0, 0] },
      });
    },
  });

  const {
    data: filesData,
    refetch: filesRefetch,
    error: filesError,
    isLoading: filesLoading,
  } = useQuery({
    queryKey: ["listFiles", id],
    queryFn: () =>
      fetch(`/api/s3/list-objects?folder=${id}`).then((res) => res.json()),
  });

  React.useEffect(() => {
    filesData && console.log("Files Data:", filesData);
  }, [filesData, filesError, filesLoading]);

  // Update form data when data changes
  React.useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        customer_name: data.customer_name || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || { type: "Point", coordinates: [0, 0] },
      });
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates:
          field === "latitude"
            ? [parseFloat(value) || 0, prev.location.coordinates[1]]
            : [prev.location.coordinates[0], parseFloat(value) || 0],
      },
    }));
  };

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
        customer_name: data.customer_name || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || { type: "Point", coordinates: [0, 0] },
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("El nombre del proyecto es obligatorio");
      return;
    }

    if (!formData.customer_name.trim()) {
      setError("El nombre del cliente es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/proyectos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating project data");
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
      {/* Breadcrumbs */}
      <CustomBreadcrumbs currentPageName={data?.name} />

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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Save/Cancel Buttons (only show when editing) */}
          {isEditing && (
            <div className="flex gap-2">
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
          )}

          {/* Project Information Section */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Información del Proyecto
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Proyecto *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Nombre del proyecto"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Cliente *
                    </label>
                    <Input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) =>
                        handleInputChange("customer_name", e.target.value)
                      }
                      placeholder="Nombre del cliente"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Dirección del proyecto"
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
                      Latitud
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.location.coordinates[0]}
                      onChange={(e) =>
                        handleLocationChange("latitude", e.target.value)
                      }
                      placeholder="Latitud"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.location.coordinates[1]}
                      onChange={(e) =>
                        handleLocationChange("longitude", e.target.value)
                      }
                      placeholder="Longitud"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="font-medium text-gray-700">
                      Nombre del Proyecto:
                    </span>
                    <p className="text-gray-900">{data.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cliente:</span>
                    <p className="text-gray-900">{data.customer_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Dirección:
                    </span>
                    <p className="text-gray-900">
                      {data.address || "No especificada"}
                    </p>
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
                  <div>
                    <span className="font-medium text-gray-700">
                      Ubicación:
                    </span>
                    <p className="text-gray-900">
                      {data.location && data.location.coordinates
                        ? `${data.location.coordinates[0]}, ${data.location.coordinates[1]}`
                        : "No especificada"}
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
        <h2 className="text-xl font-semibold mb-4">Documentos del Proyecto</h2>
        {!show && (
          <Button onClick={() => setShow(true)} variant="outline">
            Subir Archivo
          </Button>
        )}

        <FilePreviewComponent
          filesData={filesData}
          filesLoading={filesLoading}
          filesError={filesError}
          folderId={id}
          onFilesRefetch={filesRefetch}
          onError={setError}
        />
      </div>
      {show && (
        <UploadFileComponent
          folder={id}
          setShow={setShow}
          refetch={filesRefetch}
        />
      )}
    </div>
  );
};

export default Page;
