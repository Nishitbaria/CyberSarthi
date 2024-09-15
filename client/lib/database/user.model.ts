import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
  },
  contact: {
    type: String,
    required: [true, "Contact is required!"],
  },
  address: {
    type: String,
    required: [true, "Address is required!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: [true, "Email already exists!"],
  },
  context: {
    imageAnalysis: String,
    audioTranscription: String,
    imageUrls: [String],
    audioUrls: String,
  },
});

const User = models.User || model("User", UserSchema);

export default User;
