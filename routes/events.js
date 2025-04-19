// routes/events.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/User");
const authorize = require("../middleware/authorize");

// Ваш API‑ключ для Google Maps Geocoding должен быть в .env
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// POST /api/events — создать новое событие (только для админа)
router.post(
  "/",
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { title, description, date, location, availableSpots, category } = req.body;

      // Геокодируем адрес через Google Maps
      let latitude = null;
      let longitude = null;
      try {
        const geoRes = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
          params: {
            address: location,
            key: GOOGLE_MAPS_API_KEY,
            region: "kz",
            language: "ru"
          }
        });
        if (geoRes.data.results.length) {
          latitude = geoRes.data.results[0].geometry.location.lat;
          longitude = geoRes.data.results[0].geometry.location.lng;
        }
      } catch (geoErr) {
        console.warn("Не удалось геокодировать адрес:", geoErr.message);
      }

      const newEvent = new Event({
        title,
        description,
        date,
        location,
        availableSpots,
        category,
        organizer: req.user._id,
        latitude,
        longitude
      });
      const saved = await newEvent.save();

      // Подгружаем организатора и участников в ответ
      const populated = await Event.findById(saved._id)
        .populate("organizer", "name surname")
        .populate("participants", "name surname");
      res.status(201).json(populated);

    } catch (err) {
      console.error("Create event error:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

// GET /api/events — возвращаем все события
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name surname")
      .populate("participants", "name surname");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id — развернутое событие
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name surname phone")
      .populate("participants", "name surname phone points level");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events/:id/register — регистрация
router.post("/:id/register", async (req, res) => {
  const eventId = req.params.id;
  const { userId } = req.body;
  try {
    const event = await Event.findById(eventId);
    const user  = await User.findById(userId);
    if (!event || !user) return res.status(404).json({ message: "Not found" });
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "Already registered" });
    }
    if (event.availableSpots <= 0) {
      return res.status(400).json({ message: "No spots available" });
    }
    event.availableSpots--;
    event.participants.push(userId);
    await event.save();
    user.events.push(eventId);
    user.points += 10;
    await user.save();

    const updated = await Event.findById(eventId)
      .populate("organizer", "name surname phone")
      .populate("participants", "name surname phone points level");
    res.json({ message: "Registered", event: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id/register — отмена регистрации
router.delete("/:id/register", authorize(["user","admin"]), async (req, res) => {
  const eventId = req.params.id;
  const userId  = req.user._id;
  try {
    const event = await Event.findById(eventId);
    const user  = await User.findById(userId);
    if (!event || !user) return res.status(404).json({ message: "Not found" });

    event.participants = event.participants.filter(p => p.toString() !== userId.toString());
    event.availableSpots++;
    await event.save();

    user.events = user.events.filter(e => e.toString() !== eventId);
    user.points = Math.max(0, user.points - 10);
    await user.save();

    const updated = await Event.findById(eventId)
      .populate("organizer", "name surname")
      .populate("participants", "name surname points level");
    res.json({ message: "Cancelled", event: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
