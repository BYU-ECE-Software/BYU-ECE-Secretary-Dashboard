const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  admin: {type: Boolean, required: true},
  netid: {type: String, required: true, trim: true, unique: true},
  byuid: {type: String, required: true, trim: true, unique: true},
  email: {type: String, required: true, trim: true, unique: true},
  gradDate: {type: Date, required: true},
  locker: {type: mongoose.Schema.Types.ObjectId, ref: "Locker"},
  doorcodes: [{type: mongoose.Schema.Types.ObjectId, ref: "Room"}],
  overleafStatus: {type: String, enum: ['Not requested', 'Requested', 'Provisioned', 'Retired'], default: 'Not Requested'},
  overleafProfessor: {type: String, trim: true},
  jupyterhubStatus: {type: String, enum: ['Not requested', 'Requested', 'Provisioned', 'Retired'], default: 'Not Requested'},
  jupyterhubClass: {type: String, trim: true}
})

// const { attachTrackToCourses, removeTrackFromCourses } = require("../middleware/mongooseHooks");

// TrackSchema.post("save", attachTrackToCourses);
// TrackSchema.post("findOneAndDelete", removeTrackFromCourses);

module.exports = mongoose.model("Student", StudentSchema);