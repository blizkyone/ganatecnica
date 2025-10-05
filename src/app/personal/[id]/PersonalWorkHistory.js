"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/Message";
import { Button } from "@/components/ui/button";

export function PersonalWorkHistory({ personalId }) {
  const [showHistory, setShowHistory] = useState(true);

  const {
    data: workHistoryData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["personalWorkHistory", personalId],
    queryFn: () =>
      fetch(`/api/personal/${personalId}/work-history`).then((res) =>
        res.json()
      ),
    enabled: !!personalId,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatHours = (hours) => {
    if (!hours) return "0h 0m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDateRange = (start, end) => {
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-xl"
          >
            {showHistory ? "📋" : "📈"}
          </Button>
          <h2 className="text-xl font-semibold">Historial de Proyectos</h2>
          <Button
            onClick={refetch}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {showHistory && (
        <div className="space-y-6">
          {isLoading && <Loading />}
          {error && <ErrorMessage error={error} />}

          {workHistoryData && (
            <>
              {/* Summary Statistics */}
              {workHistoryData.summary && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Resumen del Historial
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Proyectos</p>
                      <p className="font-semibold text-lg">
                        {workHistoryData.summary.totalProjects}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Días Trabajados</p>
                      <p className="font-semibold text-lg">
                        {workHistoryData.summary.totalDaysWorked}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Horas Totales</p>
                      <p className="font-semibold text-lg">
                        {formatHours(workHistoryData.summary.totalHours)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Work History */}
              {workHistoryData.workHistory &&
              workHistoryData.workHistory.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">
                    Proyectos Trabajados ({workHistoryData.workHistory.length})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left p-4 font-medium text-gray-700">
                            Proyecto
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            Rol
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            Maestro(s)
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            Período
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            Días
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            Horas
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workHistoryData.workHistory.map(
                          (projectHistory, index) => (
                            <tr
                              key={`${projectHistory.project._id}-${index}`}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              {/* Project Name */}
                              <td className="p-4">
                                <div className="font-medium">
                                  {projectHistory.project.name}
                                </div>
                              </td>

                              {/* Role */}
                              <td className="p-4">
                                {projectHistory.wasMaestro ? (
                                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Maestro
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Trabajador
                                  </span>
                                )}
                              </td>

                              {/* Maestros */}
                              <td className="p-4">
                                {projectHistory.wasMaestro ? (
                                  <span className="text-gray-500 text-sm">
                                    Él mismo
                                  </span>
                                ) : projectHistory.maestros &&
                                  projectHistory.maestros.length > 0 ? (
                                  <div className="space-y-1">
                                    {projectHistory.maestros.map(
                                      (maestro, maestroIndex) => (
                                        <div
                                          key={
                                            maestro._id ||
                                            `maestro-${maestroIndex}`
                                          }
                                          className="text-sm"
                                        >
                                          {maestro.name ||
                                            "Nombre no disponible"}
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">
                                    No especificado
                                  </span>
                                )}
                              </td>

                              {/* Date Range */}
                              <td className="p-4">
                                <span className="text-sm">
                                  {formatDateRange(
                                    projectHistory.dateRange.start,
                                    projectHistory.dateRange.end
                                  )}
                                </span>
                              </td>

                              {/* Total Days */}
                              <td className="p-4">
                                <span className="text-sm font-medium">
                                  {projectHistory.totalDays}
                                </span>
                              </td>

                              {/* Total Hours */}
                              <td className="p-4">
                                <span className="text-sm font-medium">
                                  {formatHours(projectHistory.totalHours)}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay historial de proyectos disponible</p>
                  <p className="text-sm mt-2">
                    Este personal no ha trabajado en ningún proyecto registrado
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
