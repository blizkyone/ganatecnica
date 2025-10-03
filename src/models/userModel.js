import mongoose from "mongoose";
// import shortid from "shortid";

const userSchema = mongoose.Schema(
  {
    kindeId: String,
    name: String,
    email: String,
    phone: String,
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.models?.User ?? mongoose.model("User", userSchema);

export default User;
