import { X } from "lucide-react";

export default function ErrorMessage({ error }) {
  // console.log(error);
  return (
    <div className="p-2 bg-red-500 text-white rounded-md my-2">
      {error?.message && <p>{`AxiosError: ${error.message}`}</p>}
      {error?.response?.data?.message && (
        <p>{`Route error: ${error.response.data.message}`}</p>
      )}
      {error?.response?.data?.error && (
        <p>{`Route error: ${error.response.data.error}`}</p>
      )}
    </div>
  );
}

export function Message({ message, setMessage, color }) {
  return (
    <div
      className={`p-2 items-center bg-green-500 rounded-md flex justify-between flex-wrap my-2`}
    >
      <p>{message}</p>
      <div
        onClick={() => setMessage("")}
        className="hover:cursor-pointer p-2 rounded-full hover:bg-green-700"
      >
        <X />
      </div>
    </div>
  );
}

export function RedMessage({ message, setMessage }) {
  return (
    <div
      className={`p-2 items-center bg-red-500 rounded-md flex justify-between flex-wrap my-2 text-white`}
    >
      <p>{message}</p>
      <div
        onClick={() => setMessage("")}
        className="hover:cursor-pointer p-2 rounded-full hover:bg-red-700"
      >
        <X />
      </div>
    </div>
  );
}

export function YellowMessage({ message, setMessage }) {
  return (
    <div
      className={`p-2 items-center bg-yellow-500 rounded-md flex justify-between flex-wrap my-2`}
    >
      <p>{message}</p>
      <div
        onClick={() => setMessage("")}
        className="hover:cursor-pointer p-2 rounded-full hover:bg-yellow-700"
      >
        <X />
      </div>
    </div>
  );
}
