"use server";
import connectDB from "@/database";
import Proyecto from "@/models/projectModel";

const createProyecto = async (data) => {
  console.log(data);
  await connectDB();

  const proyecto = await Proyecto.create(data);

  return { message: "proyecto creado con exito" };
};

const updateProyecto = async (id, data) => {
  await connectDB();

  const proyecto = await Proyecto.findByIdAndUpdate(id, data, { new: true });
  return proyecto;
};

const deleteProyecto = async (id) => {
  await connectDB();

  await Proyecto.findByIdAndDelete(id);
};

export { createProyecto, updateProyecto, deleteProyecto };
