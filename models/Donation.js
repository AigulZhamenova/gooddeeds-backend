const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  user: {  // кто сделал донат
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  organization: {  // организация или фонд, которому помогает
    type: String,
    required: true
  },
  amount: {  // сумма доната
    type: Number,
    required: true
  },
  // Дополнительно можно добавить поле event или initiative, если донат привязан к мероприятию или инициативе
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Initiative"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);
