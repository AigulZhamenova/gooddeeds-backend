const express = require("express");
const Donation = require("../models/Donation");

const router = express.Router();

// Создать донат
router.post("/", async (req, res) => {
  const { user, organization, amount, event } = req.body;
  const newDonation = new Donation({
    user,
    organization,
    amount,
    event, // этот параметр опциональный: если донат привязан к мероприятию
  });

  try {
    const savedDonation = await newDonation.save();
    res.status(201).json(savedDonation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Получить все донаты
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find().populate("user", "name email");
    res.json(donations);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
