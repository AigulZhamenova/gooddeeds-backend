// routes/initiatives.js
const express    = require("express");
const Initiative = require("../models/Initiative");
const authorize  = require("../middleware/authorize");
const router     = express.Router();

// GET /api/initiatives — список
router.get("/", async (req, res) => {
  try {
    const list = await Initiative.find()
      .populate("organizer",  "name surname phone")
      .populate("participants","name surname phone points level");
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/initiatives/:id — детальная
router.get("/:id", async (req, res) => {
  try {
    const i = await Initiative.findById(req.params.id)
      .populate("organizer",  "name surname phone")
      .populate("participants","name surname phone points level");
    if (!i) return res.status(404).json({ message: "Not found" });
    res.json(i);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/initiatives — создать (только админ)
router.post("/", authorize(["admin"]), async (req, res) => {
  try {
    const { title, description, targetAmount, deadline } = req.body;
    const newI = new Initiative({
      title,
      description,
      targetAmount,
      deadline,            // <-- вот оно!
      organizer: req.user._id
    });
    const saved = await newI.save();
    const populated = await Initiative.findById(saved._id)
      .populate("organizer", "name surname phone");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/initiatives/:id — обновить (админ)
router.put("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const i = await Initiative.findById(req.params.id);
    if (!i) return res.status(404).json({ message: "Not found" });
    // принимаем deadline из тела, если есть
    const { title, description, targetAmount, deadline } = req.body;
    if (title         != null) i.title         = title;
    if (description   != null) i.description   = description;
    if (targetAmount  != null) i.targetAmount  = targetAmount;
    if (deadline      != null) i.deadline      = deadline;  // <-- 
    await i.save();
    const upd = await Initiative.findById(i._id)
      .populate("organizer","name surname phone");
    res.json(upd);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/initiatives/:id — удалить (админ)
router.delete("/:id", authorize(["admin"]), async (req, res) => {
  try {
    await Initiative.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/initiatives/:id/participate — участвовать (любой)
router.post("/:id/participate", authorize(["user","admin"]), async (req, res) => {
  try {
    const i = await Initiative.findById(req.params.id);
    if (!i) return res.status(404).json({ message: "Not found" });
    if (i.participants.includes(req.user._id))
      return res.status(400).json({ message: "Already joined" });
    i.participants.push(req.user._id);
    await i.save();
    res.json({ message: "Joined", initiative: i });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/initiatives/:id/donate — пожертвовать (любой)
router.post("/:id/donate", authorize(["user","admin"]), async (req, res) => {
  try {
    const { amount } = req.body;
    const i = await Initiative.findById(req.params.id);
    i.raisedAmount += amount;
    await i.save();
    res.json({ message: "Donated", raisedAmount: i.raisedAmount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
