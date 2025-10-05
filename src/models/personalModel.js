import mongoose, { model } from "mongoose";
// import shortid from "shortid";

const personalSchema = mongoose.Schema(
  {
    kindeId: String,
    name: { type: String, required: true },
    email: String,
    phone: String,
    socialSecurityNumber: String,
    ine: String,
    rfc: String,
    curp: String,
    haveDocuments: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    roles: [
      {
        roleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role",
        },
        level: {
          type: String,
          enum: ["maestro", "aprendiz", ""],
          default: "",
        },
        notes: {
          type: String,
          maxlength: 200,
        },
      },
    ],
  },
  { timestamps: true, collection: "personal" }
);

// Helper methods for working with roles
personalSchema.methods.hasRole = function (roleId) {
  return this.roles.some(
    (role) => role.roleId.toString() === roleId.toString()
  );
};

personalSchema.methods.getRoleLevel = function (roleId) {
  const role = this.roles.find(
    (role) => role.roleId.toString() === roleId.toString()
  );
  return role ? role.level : null;
};

personalSchema.methods.addRole = function (roleId, level = "", notes = "") {
  if (!this.hasRole(roleId)) {
    this.roles.push({ roleId, level, notes });
  }
  return this;
};

personalSchema.methods.removeRole = function (roleId) {
  this.roles = this.roles.filter(
    (role) => role.roleId.toString() !== roleId.toString()
  );
  return this;
};

// Static method to find personal by role
personalSchema.statics.findByRole = function (roleId, level = null) {
  const query = { "roles.roleId": roleId };
  if (level) {
    query["roles.level"] = level;
  }
  return this.find(query);
};

const Personal =
  mongoose.models?.Personal ?? mongoose.model("Personal", personalSchema);

export default Personal;
