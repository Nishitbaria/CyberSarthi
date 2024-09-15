import { Schema, model, models } from "mongoose";

const PoliceStationSchema = new Schema({
  name: {
    type: String,
    required: [true, "Police Station Name is required!"],
  },
});

const PoliceStation =
  models.PoliceStation || model("PoliceStation", PoliceStationSchema);

export default PoliceStation;
