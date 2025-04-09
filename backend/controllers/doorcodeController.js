const Doorcode = require("../models/Doorcode");

exports.getDoorcodes = async (req, res) => {
  try {
    const doorcodes = await Doorcode.find()
    res.json(doorcodes);
  }
  catch (error) {
    res.status(500).json({ error: "Failed to fetch doorcodes" });

  }
};

exports.getDoorcode = async (req, res) => {
  try {
    const doorcode = await Doorcode.findById(req.params.id)
    res.json(doorcode);
  }
  catch (error) {
    res.status(500).json({ error: "Failed to fetch doorcode" });
  }
};

exports.addDoorcode = async (req, res) => {
  const doorcode = new Doorcode(req.body);
  await doorcode.save();
  res.status(201).json(doorcode);
};

exports.updateDoorcode = async (req, res) => {
  const updatedDoorcode = await Doorcode.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedDoorcode);
};

exports.deleteDoorcode = async (req, res) => {
  await Doorcode.findByIdAndDelete(req.params.id);
  res.json({ message: "Doorcode deleted" });
};
