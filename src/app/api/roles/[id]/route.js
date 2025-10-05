import { NextResponse } from "next/server";
import connectDB from "@/database";
import Role from "@/models/roleModel";
import mongoose from "mongoose";

// GET /api/roles/[id] - Get single role
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    const role = await Role.findById(id);

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json({ error: "Error fetching role" }, { status: 500 });
  }
}

// PUT /api/roles/[id] - Update role
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    const { name, description, color, isActive } = body;

    // Basic validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "El nombre del rol es requerido" },
        { status: 400 }
      );
    }

    // Check if another role has the same name
    const existingRole = await Role.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Ya existe otro rol con este nombre" },
        { status: 400 }
      );
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim(),
      color: color || "#3B82F6",
    };

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const role = await Role.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Error updating role" }, { status: 500 });
  }
}

// DELETE /api/roles/[id] - Delete role
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ error: "Error deleting role" }, { status: 500 });
  }
}
