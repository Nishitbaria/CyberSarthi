import { Schema, model, models } from "mongoose";

const StateSchema = new Schema({
  name: {
    type: String,
    required: [true, "State Name is required!"],
  },
  policeStations: [
    {
      type: Schema.Types.ObjectId,
      ref: "PoliceStation",
    },
  ],
});

const State = models.State || model("State", StateSchema);

export default State;
