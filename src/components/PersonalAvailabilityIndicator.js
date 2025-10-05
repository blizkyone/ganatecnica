import { usePersonalAvailability } from "@/hooks/usePersonalAvailability";

export default function PersonalAvailabilityIndicator({
  personalId,
  className = "",
}) {
  const { status, color, label, isLoading, error, availabilityData } =
    usePersonalAvailability(personalId);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-sm text-red-600">Error al cargar estado</span>
      </div>
    );
  }

  const getColorClasses = (color) => {
    switch (color) {
      case "green":
        return "bg-green-500 text-green-700 border-green-200";
      case "red":
        return "bg-red-500 text-red-700 border-red-200";
      case "gray":
        return "bg-gray-500 text-gray-700 border-gray-200";
      default:
        return "bg-gray-500 text-gray-700 border-gray-200";
    }
  };

  const colorClasses = getColorClasses(color);
  const dotClass = colorClasses.split(" ")[0]; // Extract just the bg color
  const textClass = colorClasses.split(" ")[1]; // Extract just the text color

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-3 h-3 ${dotClass} rounded-full`}></div>
      <span className={`text-sm font-medium ${textClass}`}>{label}</span>
      {availabilityData?.activeProjects?.length > 0 && (
        <span className="text-xs text-gray-500">
          ({availabilityData.activeProjects.length} proyecto
          {availabilityData.activeProjects.length !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}
