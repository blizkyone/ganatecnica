"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import { WorkerDiaryEntry } from "./WorkerDiaryEntry";

export function ProjectDiary({
  projectId,
  projectData,
  diaryData,
  diaryLoading,
  diaryError,
  selectedDate,
  setSelectedDate,
  onDiaryRefetch,
  onUpdate,
}) {
  const [showDiary, setShowDiary] = useState(true);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeDate, setFinalizeDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [isFinalizingProject, setIsFinalizingProject] = useState(false);

  // Handle project finalization
  const handleFinalizeProject = async () => {
    // Validate finalization date
    const selectedDate = new Date(finalizeDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    if (selectedDate > today) {
      alert("No se puede finalizar un proyecto con una fecha futura");
      return;
    }

    setIsFinalizingProject(true);
    try {
      const response = await fetch(`/api/proyectos/${projectId}/finalize`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ finalizedDate: finalizeDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error finalizando proyecto");
      }

      const result = await response.json();

      // Close modal and refresh data
      setShowFinalizeModal(false);
      onDiaryRefetch(); // Refresh diary data
      if (onUpdate) {
        onUpdate(); // Refresh project data in parent component
      }

      // Show success message with the finalized date
      const finalizedDateStr = new Date(
        result.project.finalized
      ).toLocaleDateString("es-ES");
      alert(`Proyecto finalizado exitosamente el ${finalizedDateStr}`);
    } catch (error) {
      alert(`Error al finalizar proyecto: ${error.message}`);
    } finally {
      setIsFinalizingProject(false);
    }
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours) return "0h 0m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Get today's entries organized by worker ID
  const todayEntries = diaryData?.entries?.[selectedDate] || [];

  const entriesByWorker = todayEntries.reduce((acc, entry) => {
    const workerId = entry.worker._id?.toString() || entry.worker.toString();
    acc[workerId] = entry;
    return acc;
  }, {});

  // Get assigned workers from personalRoles
  const assignedWorkers =
    projectData?.personalRoles?.map((pr) => ({
      ...pr.personalId,
      _roleId: pr.roleId,
      _roleNotes: pr.notes,
    })) || [];

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowDiary(!showDiary)}
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-xl"
          >
            {showDiary ? "📋" : "📝"}
          </Button>
          <h2 className="text-xl font-semibold">
            Bitácora Diaria
            {projectData?.finalized && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                Finalizado{" "}
                {new Date(projectData.finalized).toLocaleDateString("es-ES")}
              </span>
            )}
            {!projectData?.finalized && todayEntries.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {todayEntries.length} trabajando
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button
            onClick={() => {
              onDiaryRefetch();
            }}
            size="sm"
            variant="outline"
          >
            🔄 Refrescar
          </Button>
          {!projectData?.finalized && (
            <Button
              onClick={() => setShowFinalizeModal(true)}
              size="sm"
              variant="destructive"
            >
              📋 Finalizar Proyecto
            </Button>
          )}
        </div>
      </div>

      {showDiary && (
        <div className="space-y-6">
          {/* Workers Table */}
          {assignedWorkers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">
                Personal del Proyecto -{" "}
                {new Date(selectedDate).toLocaleDateString("es-ES")}
              </h3>

              {diaryLoading ? (
                <Loading />
              ) : diaryError ? (
                <div className="text-red-600">
                  Error cargando bitácora: {diaryError.message}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-4 font-medium text-gray-700">
                          Trabajador
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Hora Entrada
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Hora Salida
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Horas Totales
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Estado
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Notas
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedWorkers.map((worker) => {
                        const workerId = worker._id?.toString() || worker._id;
                        const entry = entriesByWorker[workerId];
                        const isMaestro =
                          projectData?.encargado?._id === workerId ||
                          projectData?.encargado === workerId;

                        return (
                          <WorkerDiaryEntry
                            key={workerId}
                            worker={worker}
                            projectId={projectId}
                            selectedDate={selectedDate}
                            entry={entry}
                            isMaestro={isMaestro}
                            role={worker._roleId}
                            roleNotes={worker._roleNotes}
                            onRefresh={onDiaryRefetch}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay personal asignado al proyecto</p>
              <p className="text-sm mt-2">
                Asigna personal en la sección "Personal Asignado" para poder
                registrar tiempo
              </p>
            </div>
          )}

          {/* Statistics */}
          {diaryData?.stats && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Estadísticas del Proyecto
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Entradas</p>
                  <p className="font-semibold">
                    {diaryData.stats.totalEntries}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Trabajadores Activos</p>
                  <p className="font-semibold">
                    {diaryData.stats.activeWorkers}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Horas Totales</p>
                  <p className="font-semibold">
                    {formatHours(diaryData.stats.totalHours)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Personal Único</p>
                  <p className="font-semibold">
                    {diaryData.stats.uniqueWorkers}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Finalization Modal */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Finalizar Proyecto</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres finalizar este proyecto? Esta acción
              no se puede deshacer.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Finalización:
              </label>
              <Input
                type="date"
                value={finalizeDate}
                onChange={(e) => setFinalizeDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]} // Prevent future dates
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                No se pueden seleccionar fechas futuras
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowFinalizeModal(false)}
                variant="outline"
                disabled={isFinalizingProject}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFinalizeProject}
                variant="destructive"
                disabled={isFinalizingProject}
              >
                {isFinalizingProject
                  ? "Finalizando..."
                  : "Confirmar Finalización"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
