import { NextResponse } from "next/server";
import connectDB from "@/database";
import Personal from "@/models/personalModel";
import Role from "@/models/roleModel";
import mongoose from "mongoose";

// POST /api/personal/[id]/roles - Add role to personal
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { roleId, level = "", notes = "" } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid personal ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Find personal
    const personal = await Personal.findById(id);
    if (!personal) {
      return NextResponse.json(
        { error: "Personal not found" },
        { status: 404 }
      );
    }

    // Check if role is already assigned
    const existingRole = personal.roles.find(
      (r) => r.roleId.toString() === roleId
    );

    if (existingRole) {
      return NextResponse.json(
        { error: "Este rol ya está asignado a esta persona" },
        { status: 400 }
      );
    }

    // Add role
    personal.roles.push({
      roleId,
      level: level.trim(),
      notes: notes.trim(),
    });

    await personal.save();

    // Return updated personal with populated roles
    const updatedPersonal = await Personal.findById(id).populate(
      "roles.roleId",
      "name description color"
    );

    return NextResponse.json(updatedPersonal);
  } catch (error) {
    console.error("Error adding role to personal:", error);
    return NextResponse.json({ error: "Error adding role" }, { status: 500 });
  }
}
