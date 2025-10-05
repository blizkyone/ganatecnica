"use client";
import { UploadFileComponent } from "@/components/UploadFileComponent";
import { FilePreviewComponent } from "@/components/FilePreviewComponent";
import { CustomBreadcrumbs } from "@/components/CustomBreadcrumbs";
import { PersonalWorkHistory } from "./PersonalWorkHistory";
import PersonalAvailabilityIndicator from "@/components/PersonalAvailabilityIndicator";
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
      {/* Breadcrumbs */}
      <CustomBreadcrumbs currentPageName={data?.name} />

      {queryLoading && <Loading />}
      {queryError && <ErrorMessage error={queryError} />}

      {data && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{data.name}</h1>
              <PersonalAvailabilityIndicator personalId={id} />
            </div>
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

          {/* Personal Work History Section */}
          <PersonalWorkHistory personalId={id} />
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Documentos</h2>

        <Button onClick={() => setShow(true)} variant="outline">
          Subir Archivo
        </Button>

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
