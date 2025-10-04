"use client";
import NewProjectComponent from "./NewProjectComponent";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/Message";
import Loading from "@/components/Loading";
import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export default function Page() {
  const [query, setQuery] = useState("");

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["projectList"],
    queryFn: () => fetch("/api/proyectos").then((res) => res.json()),
  });

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    if (!query) return data;
    return data.filter(
      (item) => item.name.includes(query) || item.customer_name.includes(query)
    );
  }, [data, query]);

  return (
    <div className="flex flex-col gap-2 p-16 min-h-screen">
      <NewProjectComponent refetch={refetch} />
      <div className="sticky -top-4 bg-white">
        <SearchBar query={query} setQuery={setQuery} />
      </div>
      {error && <ErrorMessage error={error} />}
      {isLoading && <Loading />}

      <div className="flex flex-col gap-2">
        {filteredProjects.map((project) => (
          <div key={project._id} className="border p-4 rounded">
            <Link href={`/proyectos/${project._id}`}>
              <p>{project.customer_name}</p>
              <h3 className="text-lg font-semibold">{project.name}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
