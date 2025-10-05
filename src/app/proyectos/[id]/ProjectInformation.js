"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapLocationPicker } from "./MapLocationPicker";
import Loading from "@/components/Loading";

export function ProjectInformation({ data, onUpdate }) {
  const [showProjectInfo, setShowProjectInfo] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [centerMapOnSave, setCenterMapOnSave] = useState(false);
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

  // Update form data when data changes
  useEffect(() => {
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

      // Call the parent's update function
      await onUpdate(formData);

      setIsEditing(false);
      // Trigger map centering on successful save
      setCenterMapOnSave(true);
      // Reset the center trigger after a brief moment
      setTimeout(() => setCenterMapOnSave(false), 100);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Project Information Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Información del Proyecto</h2>
          <Button
            onClick={() => setShowProjectInfo(!showProjectInfo)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {showProjectInfo ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                Ocultar
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Mostrar
              </>
            )}
          </Button>
        </div>

        {showProjectInfo && (
          <>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación del Proyecto
                  </label>
                  <MapLocationPicker
                    initialLocation={formData.location}
                    onLocationChange={(location) =>
                      handleInputChange("location", location)
                    }
                    isEditing={isEditing}
                    centerOnSave={centerMapOnSave}
                  />
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
                </div>

                <div className="mt-6">
                  <span className="font-medium text-gray-700 block mb-2">
                    Ubicación del Proyecto:
                  </span>
                  {data.location &&
                  data.location.coordinates &&
                  (data.location.coordinates[0] !== 0 ||
                    data.location.coordinates[1] !== 0) ? (
                    <MapLocationPicker
                      initialLocation={data.location}
                      onLocationChange={() => {}}
                      isEditing={false}
                      centerOnSave={false}
                    />
                  ) : (
                    <p className="text-gray-900">No especificada</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
