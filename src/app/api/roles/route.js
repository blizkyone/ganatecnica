import { NextResponse } from "next/server";
import connectDB from "@/database";
import Role from "@/models/roleModel";

// GET /api/roles - Get all roles
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query = {};
    if (activeOnly) {
      query.isActive = true;
    }

    const roles = await Role.find(query).sort({ name: 1 });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Error fetching roles" },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create new role
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, color } = body;

    // Basic validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "El nombre del rol es requerido" },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await Role.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Ya existe un rol con este nombre" },
        { status: 400 }
      );
    }

    const roleData = {
      name: name.trim(),
      description: description?.trim(),
      color: color || "#3B82F6",
    };

    const role = await Role.create(roleData);

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Error creating role" }, { status: 500 });
  }
}
