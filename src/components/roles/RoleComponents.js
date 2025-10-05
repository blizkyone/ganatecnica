"use client";

export function RoleBadge({ role, level, size = "sm" }) {
  if (!role) return null;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const levelText = level === "maestro" ? "★" : level === "aprendiz" ? "◐" : "";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: role.color }}
    >
      <span>{role.name}</span>
      {levelText && <span>{levelText}</span>}
    </span>
  );
}

export function RoleList({ roles = [], personal, size = "sm" }) {
  if (!roles || roles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((roleData) => {
        const role = roleData.roleId || roleData; // Handle populated or non-populated
        const level = roleData.level || "";

        return (
          <RoleBadge key={role._id} role={role} level={level} size={size} />
        );
      })}
    </div>
  );
}
