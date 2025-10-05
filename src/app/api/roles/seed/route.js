import { NextResponse } from "next/server";
import connectDB from "@/database";
import Role from "@/models/roleModel";

const defaultRoles = [
  {
    name: "Electricista",
    description: "Instalación y mantenimiento de sistemas eléctricos",
    color: "#FFB800",
  },
  {
    name: "Plomero",
    description: "Instalación y reparación de tuberías y sistemas de agua",
    color: "#0EA5E9",
  },
  {
    name: "Albañil",
    description: "Construcción y reparación de estructuras de mampostería",
    color: "#8B5CF6",
  },
  {
    name: "Pintor",
    description: "Aplicación de pintura y acabados decorativos",
    color: "#10B981",
  },
  {
    name: "Carpintero",
    description: "Trabajo en madera y fabricación de estructuras",
    color: "#F59E0B",
  },
  {
    name: "Soldador",
    description: "Soldadura de metales y estructuras metálicas",
    color: "#EF4444",
  },
];

export async function POST() {
  try {
    await connectDB();

    // Clear existing roles (for clean seeding)
    await Role.deleteMany({});

    // Create new roles
    const roles = await Role.insertMany(defaultRoles);

    return NextResponse.json({
      message: `Se crearon ${roles.length} roles exitosamente`,
      roles,
    });
  } catch (error) {
    console.error("Error seeding roles:", error);
    return NextResponse.json(
      { error: "Error al crear roles por defecto" },
      { status: 500 }
    );
  }
}
