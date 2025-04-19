// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// Регистрация пользователя (волонтёра)
router.post("/register", async (req, res) => {
  const { name, surname, phone, birthday, email, password, adminCode } = req.body;
  // Если по‑прежнему нужен adminCode для админа — можно оставить, иначе убрать
  const role = adminCode === process.env.ADMIN_SECRET ? "admin" : "user";

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      surname,
      phone,
      birthday,            // ISO‑строка или Date
      email,
      password: hashedPassword,
      role
    });

    const saved = await newUser.save();
    res.status(201).json({
      userId:   saved._id,
      name:     saved.name,
      surname:  saved.surname,
      phone:    saved.phone,
      birthday: saved.birthday,
      email:    saved.email,
      role:     saved.role
    });
  } catch (err) {
    logger.error("Registration error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Вход пользователя
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      userId:   user._id,
      name:     user.name,
      surname:  user.surname,
      phone:    user.phone,
      birthday: user.birthday,
      role:     user.role
    });
  } catch (err) {
    logger.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Обновление пароля
router.put("/update-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    logger.error("Update-password error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
