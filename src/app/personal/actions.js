"use server";
import connectDB from "@/database";
import Personal from "@/models/personalModel";

const createPersonal = async (data) => {
  console.log(data);
  await connectDB();

  const personal = await Personal.create(data);

  return { message: "personal creado con exito" };
};

const updatePersonal = async (id, data) => {
  await connectDB();

  const personal = await Personal.findByIdAndUpdate(id, data, { new: true });
  return personal;
};

const deletePersonal = async (id) => {
  await connectDB();

  await Personal.findByIdAndDelete(id);
};

export { createPersonal, updatePersonal, deletePersonal };
