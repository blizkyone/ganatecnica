"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function ProjectPersonal({ projectId, projectData, onUpdate }) {
  const [showPersonalSection, setShowPersonalSection] = useState(true);
  const [selectedPersonal, setSelectedPersonal] = useState([]);
  const [selectedMaestro, setSelectedMaestro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  // Fetch all personal
  const {
    data: allPersonal,
    isLoading: personalLoading,
    error: personalError,
  } = useQuery({
    queryKey: ["allPersonal"],
    queryFn: () => fetch("/api/personal").then((res) => res.json()),
  });

  // Initialize form data when project data changes
  useEffect(() => {
    if (projectData) {
      setSelectedPersonal(projectData.personal?.map((p) => p._id || p) || []);
      setSelectedMaestro(
        projectData.encargado?._id || projectData.encargado || ""
      );
    }
  }, [projectData]);

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (updateData) => {
      const response = await fetch(`/api/proyectos/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating project");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projectDetail", projectId]);
      setIsEditing(false);
      setError(null);
      onUpdate?.();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handlePersonalToggle = (personalId) => {
    setSelectedPersonal((prev) => {
      if (prev.includes(personalId)) {
        // If removing maestro, also clear maestro selection
        if (personalId === selectedMaestro) {
          setSelectedMaestro("");
        }
        return prev.filter((id) => id !== personalId);
      } else {
        return [...prev, personalId];
      }
    });
  };

  const handleMaestroSelect = (personalId) => {
    // Maestro must be in the personal list
    if (!selectedPersonal.includes(personalId)) {
      setSelectedPersonal((prev) => [...prev, personalId]);
    }
    setSelectedMaestro(personalId);
  };

  const handleSave = () => {
    if (selectedPersonal.length === 0) {
      setError("Debe asignar al menos una persona al proyecto");
      return;
    }

    if (!selectedMaestro) {
      setError("Debe seleccionar un maestro para el proyecto");
      return;
    }

    updateProjectMutation.mutate({
      personal: selectedPersonal,
      encargado: selectedMaestro,
    });
  };

  const handleCancel = () => {
    // Reset to original values
    setSelectedPersonal(projectData.personal?.map((p) => p._id || p) || []);
    setSelectedMaestro(
      projectData.encargado?._id || projectData.encargado || ""
    );
    setIsEditing(false);
    setError(null);
  };

  // Filter personal based on search
  const filteredPersonal = allPersonal?.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get assigned personal details
  const assignedPersonal = allPersonal?.filter((p) =>
    selectedPersonal.includes(p._id)
  );

  // Get maestro details
  const maestro = allPersonal?.find((p) => p._id === selectedMaestro);

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPersonalSection(!showPersonalSection)}
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-xl"
          >
            {showPersonalSection ? "👥" : "👤"}
          </Button>
          <h2 className="text-xl font-semibold">
            Personal Asignado
            {assignedPersonal && assignedPersonal.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {assignedPersonal.length}
              </span>
            )}
          </h2>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Gestionar Personal
          </Button>
        )}
      </div>

      {showPersonalSection && (
        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!isEditing ? (
            /* Display Mode */
            <div className="space-y-4">
              {/* Current Maestro */}
              {maestro && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    👷 Maestro a Cargo
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      {maestro.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{maestro.name}</p>
                      {maestro.email && (
                        <p className="text-sm text-gray-600">{maestro.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Personal */}
              {assignedPersonal && assignedPersonal.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">
                    Personal del Proyecto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignedPersonal.map((person) => (
                      <div
                        key={person._id}
                        className="p-3 border border-gray-200 rounded-lg flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{person.name}</p>
                          {person.email && (
                            <p className="text-sm text-gray-600">
                              {person.email}
                            </p>
                          )}
                        </div>
                        {person._id === selectedMaestro && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Maestro
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay personal asignado al proyecto</p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="mt-2"
                  >
                    Asignar Personal
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Save/Cancel Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateProjectMutation.isPending}
                >
                  {updateProjectMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={updateProjectMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>

              {/* Search */}
              <div>
                <Input
                  type="text"
                  placeholder="Buscar personal por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Personal List */}
              {personalLoading ? (
                <Loading />
              ) : personalError ? (
                <div className="text-red-600">
                  Error cargando personal: {personalError.message}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPersonal?.map((person) => (
                    <div
                      key={person._id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{person.name}</p>
                            {person.email && (
                              <p className="text-sm text-gray-600">
                                {person.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedPersonal.includes(person._id)}
                              onChange={() => handlePersonalToggle(person._id)}
                              className="rounded"
                            />
                            Asignar
                          </label>
                          {selectedPersonal.includes(person._id) && (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="maestro"
                                checked={selectedMaestro === person._id}
                                onChange={() => handleMaestroSelect(person._id)}
                                className="rounded"
                              />
                              Maestro
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredPersonal?.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No se encontró personal con ese criterio de búsqueda
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
