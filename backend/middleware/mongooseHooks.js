// const Course = require("../models/Course");
// const Track = require("../models/Track");

// const attachTrackToCourses = async function (doc) {
//   const updateCourses = async (courses, trackId) => {
//     await Course.updateMany(
//       { _id: { $in: courses } },
//       { $addToSet: { tracks: trackId } }
//     );
//   };

//   await updateCourses(doc.primaryCourses, doc._id);
//   await updateCourses(doc.optionalCourses, doc._id);
// };

// const removeTrackFromCourses = async function (doc) {
//   await Course.updateMany(
//     { tracks: doc._id },
//     { $pull: { tracks: doc._id } }
//   );
// };

// // Middleware to protect admin route
// function isAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.status(401).json({ error: "Unauthorized" });
// }

// module.exports = { attachTrackToCourses, removeTrackFromCourses };