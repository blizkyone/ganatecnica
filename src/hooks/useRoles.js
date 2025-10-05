import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useRoles({ activeOnly = false } = {}) {
  const queryClient = useQueryClient();

  const {
    data: roles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["roles", { activeOnly }],
    queryFn: async () => {
      const url = `/api/roles${activeOnly ? "?activeOnly=true" : ""}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      return response.json();
    },
  });

  const createRole = useMutation({
    mutationFn: async (roleData) => {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const deleteRole = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  return {
    roles,
    isLoading,
    error,
    refetch,
    createRole,
    updateRole,
    deleteRole,
  };
}
