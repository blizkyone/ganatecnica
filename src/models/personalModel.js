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
  },
  { timestamps: true, collection: "personal" }
);

const Personal =
  mongoose.models?.Personal ?? mongoose.model("Personal", personalSchema);

export default Personal;
