import { useQuery } from "@tanstack/react-query";

export function usePersonalAvailability(personalId) {
  const {
    data: availabilityData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["personalAvailability", personalId],
    queryFn: async () => {
      if (!personalId) return null;

      // Get personal data to check active status
      const personalResponse = await fetch(`/api/personal/${personalId}`);
      if (!personalResponse.ok) {
        throw new Error("Failed to fetch personal data");
      }
      const personalData = await personalResponse.json();

      // Get projects where this personal is assigned
      const projectsResponse = await fetch(`/api/proyectos`);
      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch projects data");
      }
      const projectsData = await projectsResponse.json();

      // Find active projects where this personal is assigned
      const activeProjects = projectsData.filter(
        (project) =>
          project.active &&
          !project.finalized &&
          (project.personal?.includes(personalId) ||
            project.encargado === personalId)
      );

      return {
        personal: personalData,
        activeProjects,
        isActive: personalData.active,
        isAssigned: activeProjects.length > 0,
      };
    },
    enabled: !!personalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (!availabilityData)
      return { status: "unknown", color: "gray", label: "Desconocido" };

    const { isActive, isAssigned } = availabilityData;

    if (!isActive) {
      return {
        status: "inactive",
        color: "red",
        label: "Inactivo",
      };
    }

    if (isActive && isAssigned) {
      return {
        status: "assigned",
        color: "green",
        label: "Asignado a Proyecto",
      };
    }

    if (isActive && !isAssigned) {
      return {
        status: "available",
        color: "gray",
        label: "Disponible",
      };
    }

    return { status: "unknown", color: "gray", label: "Desconocido" };
  };

  return {
    availabilityData,
    isLoading,
    error,
    refetch,
    ...getAvailabilityStatus(),
  };
}
