const Student = require("../models/Student");

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

exports.addStudent = async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.status(201).json(student);
};

exports.updateStudent = async (req, res) => {
  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedStudent);
};

exports.deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
};

exports.bulkUpdate = async (req, res) => {
  try {
    const updates = req.body;

    for (const update of updates) {
      await Student.findByIdAndUpdate(update._id, {
        overleafProfessor: update.overleafProfessor,
        overleafStatus: update.overleafStatus,
      });
    }

    res.status(200).json({ message: "Updates successful" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    console.log("Made it to API Call");
    const newStudent = new Student(req.body);
    console.log(req.body);
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
    console.log("Here");
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res
        .status(400)
        .json({ error: "Email, Net ID, or BYU ID already exists" });
    }
    res.status(500).json({ error: "Server error during registration" });
  }
};
