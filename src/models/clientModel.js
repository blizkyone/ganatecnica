import mongoose, { model } from "mongoose";
// import shortid from "shortid";
const pointSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const clienteSchema = mongoose.Schema(
  {
    kindeId: String,
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    location: pointSchema,
    haveDocuments: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "clientes" }
);

const Cliente =
  mongoose.models?.Cliente ?? mongoose.model("Cliente", clienteSchema);

export default Cliente;
