"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PersonalManagementModal } from "./PersonalManagementModal";

export function ProjectPersonal({ projectId, projectData, onUpdate }) {
  const [showPersonalSection, setShowPersonalSection] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

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
      setError(null);
      onUpdate?.();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSavePersonal = async (personalData) => {
    try {
      await updateProjectMutation.mutateAsync(personalData);
    } catch (error) {
      throw error; // Re-throw so modal can handle it
    }
  };

  // Get assigned personal details
  const assignedPersonal = projectData?.personal || [];
  const maestro = projectData?.encargado;

  return (
    <>
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
          <Button
            onClick={() => setShowModal(true)}
            variant="outline"
            disabled={updateProjectMutation.isPending}
          >
            👥 Gestionar Personal
          </Button>
        </div>

        {showPersonalSection && (
          <div className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Current Maestro */}
            {maestro && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">
                  👷 Maestro a Cargo
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
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
                  Personal del Proyecto ({assignedPersonal.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignedPersonal.map((person) => (
                    <div
                      key={person._id}
                      className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
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
                      {person._id === maestro?._id && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          Maestro
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    👥
                  </div>
                  <p className="text-lg font-medium">
                    No hay personal asignado
                  </p>
                  <p className="text-sm mt-1">
                    Comienza asignando personal a este proyecto
                  </p>
                </div>
                <Button
                  onClick={() => setShowModal(true)}
                  variant="outline"
                  className="mt-2"
                >
                  Asignar Personal
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personal Management Modal */}
      <PersonalManagementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSavePersonal}
        currentPersonal={assignedPersonal?.map((p) => p._id) || []}
        currentMaestro={maestro?._id || ""}
        projectId={projectId}
      />
    </>
  );
}
