const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname:   
  { type: String, 
    required: true 
  }, 
  phone:      
  { type: String, required: true },       // новый номер телефона
  birthday:        
  { type: Date,   required: false },  
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    default: "beginner"
  },
  achievements: {
    type: [String],
    default: []
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  initiatives: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Initiative' }],
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
  
});


module.exports = mongoose.model("User", userSchema);
