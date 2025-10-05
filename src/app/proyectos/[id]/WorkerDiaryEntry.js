"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WorkerDiaryEntry({
  worker,
  projectId,
  selectedDate,
  entry,
  isMaestro,
  onRefresh,
}) {
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Local state to track the current entry (updated from mutations)
  const [currentEntry, setCurrentEntry] = useState(entry);

  // Initialize form values when entry data changes
  useEffect(() => {
    setCurrentEntry(entry);
  }, [entry]);

  useEffect(() => {
    if (currentEntry) {
      // Set times from existing entry
      if (currentEntry.startTime) {
        const startTime = new Date(currentEntry.startTime);
        setClockInTime(startTime.toTimeString().slice(0, 5));
      }
      if (currentEntry.endTime) {
        const endTime = new Date(currentEntry.endTime);
        setClockOutTime(endTime.toTimeString().slice(0, 5));
      } else {
        setClockOutTime(""); // Clear clock-out time if no end time
      }
      if (currentEntry.notes) {
        setNotes(currentEntry.notes);
      }
    } else {
      // Initialize with current time for clock-in, empty for clock-out
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      setClockInTime(currentTime);
      setClockOutTime(""); // Start with empty clock-out time
      setNotes("");
    }
  }, [currentEntry]);

  // Clock-in function
  const handleClockIn = async () => {
    if (!clockInTime) {
      setError("Ingresa la hora de entrada");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create full datetime
      const startDateTime = new Date(`${selectedDate}T${clockInTime}:00`);

      const response = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          workerId: workerId,
          startTime: startDateTime.toISOString(),
          notes,
          isMaestro,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error clocking in");
      }

      const newEntry = await response.json();

      // Update local state with the new entry
      setCurrentEntry(newEntry);

      // Call parent refresh
      onRefresh?.();
    } catch (error) {
      console.error("Clock-in error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Clock-out function
  const handleClockOut = async () => {
    if (!clockOutTime) {
      setError("Ingresa la hora de salida");
      return;
    }

    // Validate that clock-out time is after clock-in time
    if (currentEntry && currentEntry.startTime) {
      const startTime = new Date(currentEntry.startTime);
      const endDateTime = new Date(`${selectedDate}T${clockOutTime}:00`);

      if (endDateTime <= startTime) {
        setError("La hora de salida debe ser posterior a la hora de entrada");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create full datetime
      const endDateTime = new Date(`${selectedDate}T${clockOutTime}:00`);

      const response = await fetch("/api/diary/clock-out", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          workerId: workerId,
          endTime: endDateTime.toISOString(),
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error clocking out");
      }

      const updatedEntry = await response.json();

      // Update local state with the updated entry
      setCurrentEntry(updatedEntry);

      // Call parent refresh
      onRefresh?.();
    } catch (error) {
      console.error("Clock-out error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update entry function
  const handleUpdateEntry = async () => {
    if (!currentEntry || !currentEntry._id) {
      setError("No hay entrada válida para actualizar");
      return;
    }

    if (!clockInTime) {
      setError("Ingresa la hora de entrada");
      return;
    }

    // Validate times if both are provided
    if (clockInTime && clockOutTime) {
      const startDateTime = new Date(`${selectedDate}T${clockInTime}:00`);
      const endDateTime = new Date(`${selectedDate}T${clockOutTime}:00`);

      if (endDateTime <= startDateTime) {
        setError("La hora de salida debe ser posterior a la hora de entrada");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        startTime: new Date(`${selectedDate}T${clockInTime}:00`).toISOString(),
        notes,
      };

      if (clockOutTime) {
        updateData.endTime = new Date(
          `${selectedDate}T${clockOutTime}:00`
        ).toISOString();
        updateData.status = "completed";
      } else {
        updateData.status = "active";
      }

      const response = await fetch(`/api/diary/${currentEntry._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating entry");
      }

      const updatedEntry = await response.json();

      // Update local state with the updated entry
      setCurrentEntry(updatedEntry);

      // Call parent refresh
      onRefresh?.();
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours) return "0h 0m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Use currentEntry instead of entry
  const hasEntry = !!currentEntry;
  const isActive =
    hasEntry && currentEntry.status === "active" && !currentEntry.endTime;
  const isCompleted =
    hasEntry && currentEntry.status === "completed" && currentEntry.endTime;

  // Handle worker data - could be populated object or just ID
  const workerId = worker._id || worker;
  const workerName =
    worker.name || worker.nombres || worker.email || `Worker ${workerId}`;
  const workerEmail = worker.email;

  return (
    <div
      className={`p-4 border rounded-lg ${
        isActive
          ? "border-green-200 bg-green-50"
          : isCompleted
          ? "border-blue-200 bg-blue-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="space-y-3">
        {/* Worker Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isActive
                  ? "bg-green-500"
                  : isCompleted
                  ? "bg-blue-500"
                  : "bg-gray-400"
              }`}
            />
            <div>
              <p className="font-medium">
                {workerName}
                {isMaestro && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Maestro
                  </span>
                )}
              </p>
              {workerEmail && (
                <p className="text-sm text-gray-600">{workerEmail}</p>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {isLoading && "⏳ Procesando..."}
            {!isLoading && isActive && "🟢 Activo"}
            {!isLoading && isCompleted && "✅ Completado"}
            {!isLoading && !hasEntry && "⏱️ Sin registrar"}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Entry Details or Controls */}
        <div className="space-y-4">
          {/* Current Entry Display */}
          {hasEntry && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">
                Registro Actual
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Entrada:</span>{" "}
                  {currentEntry.startTime
                    ? formatTime(currentEntry.startTime)
                    : "--:--"}
                </div>
                <div>
                  <span className="font-medium">Salida:</span>{" "}
                  {currentEntry.endTime
                    ? formatTime(currentEntry.endTime)
                    : "--:--"}
                </div>
                <div>
                  <span className="font-medium">Total:</span>{" "}
                  {formatHours(currentEntry.totalHours)}
                </div>
              </div>
              {currentEntry.notes && (
                <div className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Notas:</span>{" "}
                  {currentEntry.notes}
                </div>
              )}
            </div>
          )}

          {/* Time Input Controls - Always visible */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">
              {hasEntry ? "Editar Registro" : "Nuevo Registro"}
            </h4>

            {/* Clock In Time */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 w-20">
                Entrada:
              </label>
              <Input
                type="time"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                className="w-32"
                disabled={isLoading}
              />
            </div>

            {/* Clock Out Time */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 w-20">
                Salida:
              </label>
              <Input
                type="time"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                className="w-32"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setClockOutTime("")}
                disabled={isLoading}
                className="text-xs px-2 py-1 h-auto"
              >
                Limpiar
              </Button>
            </div>

            {/* Notes */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 w-20">
                Notas:
              </label>
              <Input
                type="text"
                placeholder="Notas del registro..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {/* Always show update button if entry exists */}
              {hasEntry && (
                <>
                  <Button
                    onClick={handleUpdateEntry}
                    disabled={isLoading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Actualizando..." : "Actualizar Registro"}
                  </Button>
                </>
              )}

              {/* Show create button only if no entry exists */}
              {!hasEntry && (
                <Button onClick={handleClockIn} disabled={isLoading} size="sm">
                  {isLoading ? "Guardando..." : "Crear Registro"}
                </Button>
              )}

              {/* Quick Clock Out Button - only for active entries */}
              {isActive && (
                <Button
                  onClick={handleClockOut}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  {isLoading ? "Guardando..." : "Registrar Salida Rápida"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
