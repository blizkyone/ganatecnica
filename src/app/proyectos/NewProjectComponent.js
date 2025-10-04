"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProyecto } from "./actions";
import { RedMessage } from "@/components/Message";
import { useState } from "react";
import Loading from "@/components/Loading";

export default function NewProjectComponent({ refetch }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addNewProject = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form[0].value;
    const cliente = form[1].value;

    if (!name || !cliente) {
      setError("El nombre y el cliente son obligatorios");
      return;
    }

    try {
      setIsLoading(true);
      await createProyecto({ name, customer_name: cliente });
      refetch();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      <form className="flex gap-4" onSubmit={addNewProject}>
        <Input type="text" placeholder="Nombre" />
        <Input type="text" placeholder="Nombre del cliente" />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loading /> : "Agregar nuevo proyecto"}
        </Button>
      </form>
      {error && <RedMessage message={error} setMessage={setError} />}
    </div>
  );
}
