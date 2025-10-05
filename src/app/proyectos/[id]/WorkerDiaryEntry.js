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
  const [isEditing, setIsEditing] = useState(false);
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
          workerId: worker._id || worker,
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

    if (!currentEntry || !currentEntry._id) {
      setError("No hay entrada activa para registrar salida");
      return;
    }

    // Validate that end time is after start time
    const startTime = new Date(currentEntry.startTime);
    const endTime = new Date(`${selectedDate}T${clockOutTime}:00`);

    if (endTime <= startTime) {
      setError("La hora de salida debe ser posterior a la hora de entrada");
      return;
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
          workerId: worker._id || worker,
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
      setError("La hora de entrada es requerida");
      return;
    }

    // Validate times if both are provided
    if (clockOutTime) {
      const startTime = new Date(`${selectedDate}T${clockInTime}:00`);
      const endTime = new Date(`${selectedDate}T${clockOutTime}:00`);

      if (endTime <= startTime) {
        setError("La hora de salida debe ser posterior a la hora de entrada");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        notes: notes || "",
      };

      // Always update start time
      updateData.startTime = new Date(
        `${selectedDate}T${clockInTime}:00`
      ).toISOString();

      // Update end time if provided
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

  // Helper functions
  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5);
  };

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

  const handleSave = async () => {
    if (hasEntry) {
      await handleUpdateEntry();
    } else {
      await handleClockIn();
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset values to current entry
    if (currentEntry) {
      if (currentEntry.startTime) {
        setClockInTime(
          new Date(currentEntry.startTime).toTimeString().slice(0, 5)
        );
      }
      if (currentEntry.endTime) {
        setClockOutTime(
          new Date(currentEntry.endTime).toTimeString().slice(0, 5)
        );
      }
      setNotes(currentEntry.notes || "");
    }
  };

  return (
    <tr
      className={`border-b border-gray-200 hover:bg-gray-50 ${
        isActive ? "bg-green-50" : isCompleted ? "bg-blue-50" : ""
      }`}
    >
      {/* Worker Name */}
      <td className="p-4">
        <div className="flex items-center gap-2">
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
            <div className="font-medium">{workerName}</div>
            {isMaestro && (
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                Maestro
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Clock In Time */}
      <td className="p-4">
        {isEditing ? (
          <Input
            type="time"
            value={clockInTime}
            onChange={(e) => setClockInTime(e.target.value)}
            className="w-32"
            disabled={isLoading}
          />
        ) : (
          <span className="text-sm">
            {hasEntry ? formatTime(currentEntry.startTime) : "--:--"}
          </span>
        )}
      </td>

      {/* Clock Out Time */}
      <td className="p-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
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
              className="text-xs px-2 py-1 h-auto"
            >
              ×
            </Button>
          </div>
        ) : (
          <span className="text-sm">
            {hasEntry ? formatTime(currentEntry.endTime) : "--:--"}
          </span>
        )}
      </td>

      {/* Total Hours */}
      <td className="p-4">
        <span className="text-sm">
          {hasEntry ? formatHours(currentEntry.totalHours) : "0h 0m"}
        </span>
      </td>

      {/* Status */}
      <td className="p-4">
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${
            isActive
              ? "bg-green-100 text-green-800"
              : isCompleted
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isActive ? "Activo" : isCompleted ? "Completado" : "Sin registro"}
        </span>
      </td>

      {/* Notes */}
      <td className="p-4">
        {isEditing ? (
          <Input
            type="text"
            placeholder="Notas..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full"
            disabled={isLoading}
          />
        ) : (
          <span className="text-sm text-gray-600">
            {hasEntry ? currentEntry.notes || "Sin notas" : "--"}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="p-4">
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}

        {isEditing ? (
          <div className="flex gap-1">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "..." : "💾"}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              ✕
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              ✏️
            </Button>
            {isActive && (
              <Button
                onClick={handleClockOut}
                disabled={isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                🔚
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
