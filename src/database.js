import mongoose from "mongoose";
import Proyecto from "@/models/projectModel.js";
import DiaryEntry from "@/models/diaryEntryModel.js";
import Personal from "./models/personalModel";
import Cliente from "./models/clientModel";
import User from "./models/userModel";

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
    console.log(`Error: ${error.message}`);
    // process.exit(1);
  }
};

export default connectDB;
