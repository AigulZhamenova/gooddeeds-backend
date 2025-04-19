const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  availableSpots: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["экология", "дети", "пожилые", "животные", "образование", "здравоохранение", "гуманитарная помощь", "культура"]
  },
  // Новые поля для координат
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedPoints: {
    type: Boolean,
    default: false
  }
  
  
  
});

  
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
