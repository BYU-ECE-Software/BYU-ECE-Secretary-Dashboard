const mongoose = require("mongoose");

const LockerSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  available: { type: String, required: true, default: "True"},
  // assignment: {type: String, required: true, default: "(Empty)"},
  assignment: {type: mongoose.Schema.Types.ObjectId, ref: "Student"},
  
});

module.exports = mongoose.model("Locker", LockerSchema);