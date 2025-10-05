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
}) {
  const [showDiary, setShowDiary] = useState(true);

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

  // Get assigned workers
  const assignedWorkers = projectData?.personal || [];

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
            {todayEntries.length > 0 && (
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
        </div>
      </div>

      {showDiary && (
        <div className="space-y-6">
          {/* Workers List */}
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
                <div className="space-y-3">
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
                        onRefresh={onDiaryRefetch}
                      />
                    );
                  })}
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
    </div>
  );
}
