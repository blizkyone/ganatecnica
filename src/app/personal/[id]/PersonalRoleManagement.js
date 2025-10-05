"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleBadge, RoleList } from "@/components/roles/RoleComponents";
import { useRoles } from "@/hooks/useRoles";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function PersonalRoleManagement({ personalId, personalData, onUpdate }) {
  const { roles: availableRoles, isLoading: rolesLoading } = useRoles({
    activeOnly: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const currentRoles = personalData?.roles || [];

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ roleId, level, notes }) => {
      const response = await fetch(`/api/personal/${personalId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleId, level, notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al agregar rol");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalDetail", personalId],
      });
      setShowAddForm(false);
      setSelectedRoleId("");
      setSelectedLevel("");
      setNotes("");
      setError(null);
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId) => {
      const response = await fetch(
        `/api/personal/${personalId}/roles/${roleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar rol");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalDetail", personalId],
      });
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, level, notes }) => {
      const response = await fetch(
        `/api/personal/${personalId}/roles/${roleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ level, notes }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar rol");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalDetail", personalId],
      });
      if (onUpdate) onUpdate();
    },
  });

  const handleAddRole = () => {
    if (!selectedRoleId) {
      setError("Debe seleccionar un rol");
      return;
    }

    addRoleMutation.mutate({
      roleId: selectedRoleId,
      level: selectedLevel,
      notes: notes.trim(),
    });
  };

  const handleRemoveRole = (roleId) => {
    if (confirm("¿Estás seguro de eliminar este rol?")) {
      removeRoleMutation.mutate(roleId);
    }
  };

  const handleUpdateRole = (roleId, level, notes) => {
    updateRoleMutation.mutate({ roleId, level, notes });
  };

  // Filter available roles to exclude already assigned ones
  const filteredAvailableRoles =
    availableRoles?.filter((role) => {
      const isAlreadyAssigned = currentRoles.some(
        (personalRole) =>
          personalRole.roleId?._id === role._id ||
          personalRole.roleId === role._id
      );
      const matchesSearch =
        !searchTerm ||
        role.name.toLowerCase().includes(searchTerm.toLowerCase());
      return !isAlreadyAssigned && matchesSearch;
    }) || [];

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Roles y Capacidades</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          size="sm"
          disabled={filteredAvailableRoles.length === 0}
        >
          {showAddForm ? "Cancelar" : "Agregar Rol"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Role Form */}
      {showAddForm && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Agregar Nuevo Rol</h3>

          <div className="space-y-4">
            {/* Search roles */}
            <div>
              <Input
                placeholder="Buscar roles disponibles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Rol *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {filteredAvailableRoles.map((role) => (
                  <div
                    key={role._id}
                    onClick={() => setSelectedRoleId(role._id)}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedRoleId === role._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <RoleBadge role={role} size="sm" />
                  </div>
                ))}
              </div>
              {filteredAvailableRoles.length === 0 && (
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "No se encontraron roles"
                    : "Todos los roles disponibles ya están asignados"}
                </p>
              )}
            </div>

            {/* Level selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Experiencia
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin especificar</option>
                <option value="aprendiz">Aprendiz</option>
                <option value="maestro">Maestro</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Certificaciones, experiencia específica, etc."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {notes.length}/200 caracteres
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddRole}
                disabled={!selectedRoleId || addRoleMutation.isPending}
                size="sm"
              >
                {addRoleMutation.isPending ? "Agregando..." : "Agregar Rol"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedRoleId("");
                  setSelectedLevel("");
                  setNotes("");
                  setSearchTerm("");
                  setError(null);
                }}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Roles */}
      <div>
        {currentRoles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tiene roles asignados</p>
            <p className="text-sm mt-1">
              Agrega roles para indicar las capacidades y experiencia de esta
              persona
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">
              Roles Asignados ({currentRoles.length})
            </h3>
            {currentRoles.map((personalRole) => {
              const role = personalRole.roleId;
              if (!role) return null;

              return (
                <div
                  key={role._id}
                  className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RoleBadge role={role} level={personalRole.level} />
                      {personalRole.level && (
                        <span className="text-xs text-gray-500">
                          ({personalRole.level})
                        </span>
                      )}
                    </div>
                    {personalRole.notes && (
                      <p className="text-sm text-gray-600">
                        {personalRole.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newLevel = prompt(
                          "Nuevo nivel (maestro, aprendiz o vacío):",
                          personalRole.level || ""
                        );
                        if (newLevel !== null) {
                          const newNotes = prompt(
                            "Notas:",
                            personalRole.notes || ""
                          );
                          if (newNotes !== null) {
                            handleUpdateRole(
                              role._id,
                              newLevel.trim(),
                              newNotes.trim()
                            );
                          }
                        }
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveRole(role._id)}
                      disabled={removeRoleMutation.isPending}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
