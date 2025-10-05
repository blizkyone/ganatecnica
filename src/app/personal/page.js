"use client";
import NewPersonalComponent from "./NewPersonalComponent";
import PersonalAvailabilityBadge from "@/components/PersonalAvailabilityBadge";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/Message";
import Loading from "@/components/Loading";
import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export default function Page() {
  const [query, setQuery] = useState("");

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["personalListWithAvailability"],
    queryFn: () =>
      fetch("/api/personal?includeAvailability=true").then((res) => res.json()),
    staleTime: 2 * 60 * 1000, // 2 minutes - availability doesn't change that often
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredPersonal = useMemo(() => {
    if (!data) return [];
    if (!query) return data;
    return data.filter((item) => item.name.includes(query));
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
                  <h3 className="text-lg font-semibold">{personal.name}</h3>
                  <PersonalAvailabilityBadge
                    availability={personal.availability}
                    className="mt-1"
                  />
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
