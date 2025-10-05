"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";

export function PersonalManagementModal({
  isOpen,
  onClose,
  onSave,
  currentPersonal = [],
  currentMaestro = "",
  projectId,
}) {
  const [selectedPersonal, setSelectedPersonal] = useState([]);
  const [selectedMaestro, setSelectedMaestro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all personal with availability data for better selection
  const {
    data: allPersonal,
    isLoading: personalLoading,
    error: personalError,
  } = useQuery({
    queryKey: ["allPersonalWithAvailability"],
    queryFn: () =>
      fetch("/api/personal?includeAvailability=true").then((res) => res.json()),
    enabled: isOpen, // Only fetch when modal is open
  });

  // Initialize form data when modal opens or current data changes
  useEffect(() => {
    if (isOpen) {
      setSelectedPersonal([...currentPersonal]);
      setSelectedMaestro(currentMaestro);
      setError(null);
      setSearchTerm("");
    }
  }, [isOpen, currentPersonal, currentMaestro]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        handleCancel();
      } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (selectedPersonal.length > 0 && selectedMaestro && !isSaving) {
          handleSave();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedPersonal, selectedMaestro, isSaving]);

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

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

  const handleSave = async () => {
    if (selectedPersonal.length === 0) {
      setError("Debe asignar al menos una persona al proyecto");
      return;
    }

    if (!selectedMaestro) {
      setError("Debe seleccionar un maestro para el proyecto");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        personal: selectedPersonal,
        encargado: selectedMaestro,
      });
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedPersonal([...currentPersonal]);
    setSelectedMaestro(currentMaestro);
    setError(null);
    setSearchTerm("");
    onClose();
  };

  // Filter personal based on search
  const filteredPersonal = allPersonal?.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get availability badge for each person
  const getAvailabilityBadge = (availability) => {
    if (!availability) return null;

    const { color, label, projectCount } = availability;
    const colorClasses = {
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      gray: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          colorClasses[color] || colorClasses.gray
        }`}
      >
        {label} {projectCount > 0 && `(${projectCount})`}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Gestionar Personal del Proyecto
            </h2>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              ✕
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Selecciona el personal que trabajará en este proyecto y designa un
            maestro a cargo.
          </p>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Buscar personal por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Summary */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Seleccionados:</strong> {selectedPersonal.length} personas
              {selectedMaestro && (
                <span className="ml-4">
                  <strong>Maestro:</strong>{" "}
                  {allPersonal?.find((p) => p._id === selectedMaestro)?.name ||
                    "Seleccionando..."}
                </span>
              )}
            </p>
          </div>

          {/* Personal List */}
          <div className="flex-1 overflow-y-auto">
            {personalLoading ? (
              <Loading />
            ) : personalError ? (
              <div className="text-red-600">
                Error cargando personal: {personalError.message}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPersonal?.map((person) => (
                  <div
                    key={person._id}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      selectedPersonal.includes(person._id)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
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
                          <div className="mt-1">
                            {getAvailabilityBadge(person.availability)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPersonal.includes(person._id)}
                            onChange={() => handlePersonalToggle(person._id)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm font-medium">Asignar</span>
                        </label>
                        {selectedPersonal.includes(person._id) && (
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="maestro"
                              checked={selectedMaestro === person._id}
                              onChange={() => handleMaestroSelect(person._id)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-yellow-700">
                              Maestro
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPersonal?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontró personal con ese criterio de búsqueda
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Esc</kbd>{" "}
            para cancelar •
            <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs ml-1">
              Ctrl+Enter
            </kbd>{" "}
            para guardar
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving || selectedPersonal.length === 0 || !selectedMaestro
              }
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
