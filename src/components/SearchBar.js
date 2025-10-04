import { SearchIcon } from "lucide-react";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="flex gap-2 border-1 pl-2 border-gray-200 shadow rounded-md items-center w-full">
      <SearchIcon size={18} className="text-gray-500" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="outline-none w-full p-2"
      />
    </div>
  );
}
