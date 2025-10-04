"use client";
import NewPersonalComponent from "./NewPersonalComponent";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/Message";
import Loading from "@/components/Loading";
import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export default function Page() {
  const [query, setQuery] = useState("");

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["personalList"],
    queryFn: () => fetch("/api/personal").then((res) => res.json()),
  });

  const filteredPersonal = useMemo(() => {
    if (!data) return [];
    if (!query) return data;
    return data.filter((item) => item.name.includes(query));
  }, [data, query]);

  return (
    <div className="flex flex-col p-16 min-h-screen">
      <NewPersonalComponent refetch={refetch} />
      <div className="sticky -top-4 bg-white">
        <SearchBar query={query} setQuery={setQuery} />
      </div>
      {error && <ErrorMessage error={error} />}
      {isLoading && <Loading />}

      <div className="flex flex-col gap-2">
        {filteredPersonal.map((personal) => (
          <div key={personal._id} className="border p-4 rounded">
            <Link href={`/personal/${personal._id}`}>
              <h3 className="text-lg font-semibold">{personal.name}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
