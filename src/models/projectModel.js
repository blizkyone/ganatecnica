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

const proyectoSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    customer_name: { type: String, required: true },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
    },
    encargado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Personal",
    },
    personal: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Personal",
      },
    ],
    address: String,
    location: pointSchema,
    email: String,
    phone: String,
    haveDocuments: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "proyectos" }
);

const Proyecto =
  mongoose.models?.Proyecto ?? mongoose.model("Proyecto", proyectoSchema);

export default Proyecto;
