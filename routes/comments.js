const express = require("express");
const Comment = require("../models/Comment");
const Event = require("../models/Event");
const Initiative = require("../models/Initiative");

const router = express.Router();

// Добавление комментария к мероприятию
router.post("/event/:eventId", async (req, res) => {
  const { content } = req.body;
  const { eventId } = req.params;

  const newComment = new Comment({
    user: req.user.id, // предполагаем, что мы используем middleware для аутентификации
    content
  });

  try {
    const savedComment = await newComment.save();
    const event = await Event.findById(eventId);
    event.comments.push(savedComment._id);
    await event.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Добавление комментария к инициативе
router.post("/initiative/:initiativeId", async (req, res) => {
  const { content } = req.body;
  const { initiativeId } = req.params;

  const newComment = new Comment({
    user: req.user.id, // предполагаем, что мы используем middleware для аутентификации
    content
  });

  try {
    const savedComment = await newComment.save();
    const initiative = await Initiative.findById(initiativeId);
    initiative.comments.push(savedComment._id);
    await initiative.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Получение комментариев для мероприятия
router.get("/event/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate("comments");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event.comments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Получение комментариев для инициативы
router.get("/initiative/:initiativeId", async (req, res) => {
  const { initiativeId } = req.params;

  try {
    const initiative = await Initiative.findById(initiativeId).populate("comments");
    if (!initiative) return res.status(404).json({ message: "Initiative not found" });
    res.json(initiative.comments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
