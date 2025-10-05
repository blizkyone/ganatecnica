/**
 * Optimized availability badge component that uses pre-calculated availability data
 * instead of making separate API calls. Perfect for lists where performance matters.
 */
export default function PersonalAvailabilityBadge({
  availability,
  className = "",
}) {
  if (!availability) {
    return null;
  }

  const { status, color, label, projectCount } = availability;

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
      <div className={`w-2 h-2 ${dotClass} rounded-full`}></div>
      <span className={`text-xs font-medium ${textClass}`}>{label}</span>
      {projectCount > 0 && (
        <span className="text-xs text-gray-500">({projectCount})</span>
      )}
    </div>
  );
}
