"use client";
import NewPersonalComponent from "./NewPersonalComponent";
import PersonalAvailabilityBadge from "@/components/PersonalAvailabilityBadge";
import { RoleList } from "@/components/roles/RoleComponents";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/Message";
import Loading from "@/components/Loading";
import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export default function Page() {
  const [query, setQuery] = useState("");

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["personalListWithAvailabilityAndRoles"],
    queryFn: () =>
      fetch("/api/personal?includeAvailability=true&includeRoles=true").then(
        (res) => res.json()
      ),
    staleTime: 2 * 60 * 1000, // 2 minutes - availability doesn't change that often
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredPersonal = useMemo(() => {
    if (!data) return [];
    if (!query) return data;
    return data.filter(
      (item) =>
        item.name.includes(query) ||
        (item.roles &&
          item.roles.length > 0 &&
          item.roles.some((role) =>
            role.roleId.name.toLowerCase().includes(query)
          ))
    );
  }, [data, query]);

  return (
    <div className="flex flex-col gap-2 p-16 min-h-screen">
      <NewPersonalComponent refetch={refetch} />
      <div className="sticky -top-4 bg-white">
        <SearchBar query={query} setQuery={setQuery} />
      </div>
      {error && <ErrorMessage error={error} />}
      {isLoading && <Loading />}

      <div className="flex flex-col gap-2">
        {filteredPersonal.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontró personal</p>
            {query && (
              <p className="text-sm mt-2">
                Intenta con un término de búsqueda diferente
              </p>
            )}
          </div>
        )}

        {filteredPersonal.map((personal) => (
          <div
            key={personal._id}
            className="border p-4 rounded hover:bg-gray-50 transition-colors"
          >
            <Link href={`/personal/${personal._id}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="text-lg font-semibold">{personal.name}</h3>
                    <p>{personal.phone || ""}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <PersonalAvailabilityBadge
                      availability={personal.availability}
                    />
                    {personal.roles && personal.roles.length > 0 && (
                      <RoleList roles={personal.roles} size="xs" />
                    )}
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
