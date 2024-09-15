const mongoose = require("mongoose");

// State and PoliceStation models defined in the same file
const { Schema, model, models } = mongoose;

// Define the State schema
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

// Define the PoliceStation schema
const PoliceStationSchema = new Schema({
  name: {
    type: String,
    required: [true, "Police Station Name is required!"],
  },
});

// Create models
const State = models.State || model("State", StateSchema);
const PoliceStation =
  models.PoliceStation || model("PoliceStation", PoliceStationSchema);

// MongoDB connection string
const mongoURI =
  "mongodb+srv://AntiScamAPP:U3CljPXLARzoYI2P@nodejsexpressjsprojects.pbdp0vj.mongodb.net/AntiScamAI"; // replace with your MongoDB URI

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Function to add state and police stations
async function addStateAndPoliceStations(stateName, policeStationNamesString) {
  try {
    // Split the input string by commas and trim whitespace
    const policeStationNames = policeStationNamesString
      .split(",")
      .map((name) => name.trim());

    // Create PoliceStation documents
    const policeStations = await Promise.all(
      policeStationNames.map(async (name) => {
        let station = await PoliceStation.findOne({ name });
        if (!station) {
          station = new PoliceStation({ name });
          await station.save();
        }
        return station._id;
      })
    );

    // Check if state already exists
    let state = await State.findOne({ name: stateName });
    if (!state) {
      // Create new State with the police stations
      state = new State({ name: stateName, policeStations });
      await state.save();
      console.log("State and Police Stations added successfully!");
    } else {
      // Update state with new police stations if it already exists
      state.policeStations.push(...policeStations);
      await state.save();
      console.log("Police stations updated in the existing state!");
    }
  } catch (error) {
    console.error("Error adding state and police stations:", error);
  } finally {
    // Close MongoDB connection after the operation
    mongoose.connection.close();
  }
}

// Example usage
const stateName = "Pune"; // Replace with your state name
const policeStationNamesString =
  "Wakad Police Station,Sangavi Police Station,Hinjewadi Police ,Chaturshringi Police Station,Pimpri Police Station,Chinchwad Police Station,Nigadi Police Station,Bhosari Police Station,MIDC Bhosari Police Station,Yerawada Police Station,Vimantal Police ,Vishrantwadi Police Station,Khadaki Police Station,Dighi Police Station,Chandan Nagar Police ,Mundhawa Police Station,Hadapsar Police Station,Kondhwa Police Station,Wanawadi Police Station,Faraskhana Police Station,Khadak Police Station,Vishrambaug Police Station,Shivajinagar Police Station,Deccan Police Station,Kothrud Police Station,Warje Malwadi Police Station,Bharati Vidyapeeth P Stn,Sahakar Nagar Police Station,Market Yard Police Station,Sinhagad Police Station,Bibvewadi Police Station,Dattawadi Police Station,Swargate Police Station,Bund Garden Police Station,Koregaon Park Police Station,Lashkar Police Station,Samarth Police Station"; // Replace with your comma-separated police station names

addStateAndPoliceStations(stateName, policeStationNamesString);
