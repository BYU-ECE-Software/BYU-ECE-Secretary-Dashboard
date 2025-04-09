const Locker = require("../models/Locker");

exports.getLockers = async (req, res) => {
  try {
    const lockers = await Locker.find()
    res.json(lockers);
  }
  catch (error) {
    res.status(500).json({ error: "Failed to fetch lockers" });

  }
};

exports.getLocker = async (req, res) => {
  try {
    const locker = await Locker.findById(req.params.id)
    res.json(locker);
  }
  catch (error) {
    res.status(500).json({ error: "Failed to fetch locker" });
  }
};

exports.addLocker = async (req, res) => {
  const locker = new Locker(req.body);
  await locker.save();
  res.status(201).json(locker);
};

exports.updateLocker = async (req, res) => {
  const updatedLocker = await Locker.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedLocker);
};

exports.deleteLocker = async (req, res) => {
  await Locker.findByIdAndDelete(req.params.id);
  res.json({ message: "Locker deleted" });
};
