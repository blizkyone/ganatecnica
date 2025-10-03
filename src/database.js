import mongoose from "mongoose";
// import Dish from "./models/platilloModel";
// import Menu from "./models/menuModel";
// import Ingredient from "./models/ingredienteModel";
// import User from "./models/userModel";
// import Location from "./models/locationModel";
// import Order from "./models/orderModel";
// import Kitchen from "./models/kitchenModel";
// import Survey from "./models/surveyModel";
// import Prospect from "./models/prospectModel";

const globalForMongoose = global;

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = { conn: null, promise: null };
}

const connection = {};

const connectDB = async () => {
  // console.log("initiate conn");
  if (connection.isConnected) return;
  // if (mongoose.connections[0].readyState) return;
  //seems you can replace the above with 'mongoose.connections[0].readyState'
  // console.log("new conn...");

  try {
    // mongoose.connection.on("connected", () => console.log("connected"));
    const conn = await mongoose.connect(process.env.MONGO_URI);

    connection.isConnected = conn.connections[0].readyState;

    return;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // process.exit(1);
  }
};

export default connectDB;
