import { NextResponse } from "next/server";
import connectDB from "@/database";
import Personal from "@/models/personalModel";
import mongoose from "mongoose";

// PUT /api/personal/[id]/roles/[roleId] - Update role assignment
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id, roleId } = params;
    const body = await request.json();
    const { level = "", notes = "" } = body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(roleId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Find personal
    const personal = await Personal.findById(id);
    if (!personal) {
      return NextResponse.json(
        { error: "Personal not found" },
        { status: 404 }
      );
    }

    // Find and update the role
    const roleIndex = personal.roles.findIndex(
      (r) => r.roleId.toString() === roleId
    );

    if (roleIndex === -1) {
      return NextResponse.json(
        { error: "Role assignment not found" },
        { status: 404 }
      );
    }

    personal.roles[roleIndex].level = level.trim();
    personal.roles[roleIndex].notes = notes.trim();

    await personal.save();

    // Return updated personal with populated roles
    const updatedPersonal = await Personal.findById(id).populate(
      "roles.roleId",
      "name description color"
    );

    return NextResponse.json(updatedPersonal);
  } catch (error) {
    console.error("Error updating role assignment:", error);
    return NextResponse.json({ error: "Error updating role" }, { status: 500 });
  }
}

// DELETE /api/personal/[id]/roles/[roleId] - Remove role from personal
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id, roleId } = params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(roleId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Find personal
    const personal = await Personal.findById(id);
    if (!personal) {
      return NextResponse.json(
        { error: "Personal not found" },
        { status: 404 }
      );
    }

    // Remove the role
    const initialLength = personal.roles.length;
    personal.roles = personal.roles.filter(
      (r) => r.roleId.toString() !== roleId
    );

    if (personal.roles.length === initialLength) {
      return NextResponse.json(
        { error: "Role assignment not found" },
        { status: 404 }
      );
    }

    await personal.save();

    // Return updated personal with populated roles
    const updatedPersonal = await Personal.findById(id).populate(
      "roles.roleId",
      "name description color"
    );

    return NextResponse.json(updatedPersonal);
  } catch (error) {
    console.error("Error removing role from personal:", error);
    return NextResponse.json({ error: "Error removing role" }, { status: 500 });
  }
}
