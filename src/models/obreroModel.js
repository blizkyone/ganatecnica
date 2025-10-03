import mongoose from "mongoose";
// import shortid from "shortid";

const obreroSchema = mongoose.Schema(
  {
    kindeId: String,
    name: String,
    email: String,
    phone: String,
    socialSecurityNumber: String,
  },
  { timestamps: true }
);

const Obrero =
  mongoose.models?.Obrero ?? mongoose.model("Obrero", obreroSchema);

export default Obrero;
