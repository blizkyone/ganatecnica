"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import { useRoles } from "@/hooks/useRoles";
import { RoleBadge } from "@/components/roles/RoleComponents";

export default function RolesManagement() {
  const { roles, isLoading, createRole, updateRole, deleteRole } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole._id, ...formData });
      } else {
        await createRole.mutateAsync(formData);
      }

      // Reset form
      setFormData({ name: "", description: "", color: "#3B82F6" });
      setShowForm(false);
      setEditingRole(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      color: role.color,
    });
    setShowForm(true);
  };

  const handleDelete = async (role) => {
    if (confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
      try {
        await deleteRole.mutateAsync(role._id);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", color: "#3B82F6" });
    setShowForm(false);
    setEditingRole(null);
    setError(null);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Roles</h1>
        <div className="flex gap-2">
          {roles.length === 0 && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch("/api/roles/seed", {
                    method: "POST",
                  });
                  if (response.ok) {
                    window.location.reload();
                  }
                } catch (err) {
                  setError("Error al crear roles por defecto");
                }
              }}
            >
              Crear Roles Por Defecto
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>Nuevo Rol</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingRole ? "Editar Rol" : "Nuevo Rol"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej: Electricista, Plomero..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descripción opcional del rol..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <RoleBadge
                  role={{
                    name: formData.name || "Vista previa",
                    color: formData.color,
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting
                  ? "Guardando..."
                  : editingRole
                  ? "Actualizar"
                  : "Crear"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            Roles Disponibles ({roles.length})
          </h2>
        </div>

        <div className="p-4">
          {roles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay roles creados. Crea el primer rol para comenzar.
            </p>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <RoleBadge role={role} size="md" />
                    <div>
                      <h3 className="font-medium">{role.name}</h3>
                      {role.description && (
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(role)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(role)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
