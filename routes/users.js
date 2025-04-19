// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authorize = require("../middleware/authorize");

// Получить всех пользователей (можно ограничить админом, если нужно)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Получить одного пользователя по ID (для своего профиля или для админа)
router.get(
  "/:id",
  authorize(["user", "admin"]),
  async (req, res) => {
    try {
      const u = await User.findById(req.params.id)
        .select("-password")                             // не отдаём пароль
        .populate("events", "title date")                // список мероприятий
        .populate("initiatives", "title targetAmount raisedAmount"); // инициа­тивы
      if (!u) return res.status(404).json({ message: "User not found" });
      res.json(u);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Создать нового пользователя
router.post("/", async (req, res) => {
  const { name, surname, phone, birthday, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists." });
    }
    const newUser = new User({ name, surname, phone, birthday, email, password, role });
    await newUser.save();
    const { _id, name: n, surname: s, phone: p, birthday: b, email: e, role: r } = newUser;
    res.status(201).json({ id: _id, name: n, surname: s, phone: p, birthday: b, email: e, role: r });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Обновить пользователя
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Удалить пользователя
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
