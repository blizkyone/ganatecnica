"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPersonal } from "./actions";
import { RedMessage } from "@/components/Message";
import { useState } from "react";
import Loading from "@/components/Loading";
import { set } from "mongoose";

export default function NewPersonalComponent({ refetch }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addNewPersonal = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form[0].value;

    if (!name) {
      setError("El nombre es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      await createPersonal({ name });
      refetch();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      <form className="flex gap-4" onSubmit={addNewPersonal}>
        <Input type="text" placeholder="Nombre" />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loading /> : "Agregar nuevo personal"}
        </Button>
      </form>
      {error && <RedMessage message={error} setMessage={setError} />}
    </div>
  );
}
