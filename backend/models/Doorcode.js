const mongoose = require("mongoose");

const DoorcodeSchema = new mongoose.Schema({
  room: {type: String, required: true, unique: true, trim: true},
  code: {type: String, trim: true, required: true}

});

module.exports = mongoose.model("Doorcode", DoorcodeSchema);