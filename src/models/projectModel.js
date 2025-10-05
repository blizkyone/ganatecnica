import mongoose, { model } from "mongoose";
// import shortid from "shortid";

// Ensure Personal and Role models are available for population
import "./personalModel.js";
import "./roleModel.js";

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
    personalRoles: [
      {
        personalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Personal",
          required: true,
        },
        roleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role",
        },
        notes: {
          type: String,
          maxlength: 200,
        },
      },
    ],
    address: String,
    location: pointSchema,
    email: String,
    phone: String,
    haveDocuments: { type: Boolean, default: false },
    finalized: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "proyectos" }
);

const Proyecto =
  mongoose.models?.Proyecto ?? mongoose.model("Proyecto", proyectoSchema);

export default Proyecto;
