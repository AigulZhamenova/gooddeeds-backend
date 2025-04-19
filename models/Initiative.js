const mongoose = require("mongoose");

const initiativeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  raisedAmount: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
    required: true,         // новая дата дедлайна
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  organizer:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  
});

module.exports = mongoose.model("Initiative", initiativeSchema);
