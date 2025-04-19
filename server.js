const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./utils/logger");
const paymentRoutes = require("./routes/payment");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Для парсинга JSON

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));




app.use("/api/events", require("./routes/events"));

app.use("/api/users", require("./routes/users"));  

app.use("/api/auth", require("./routes/auth"));

app.use("/api/initiatives", require("./routes/initiatives"));

app.use("/api/donations", require("./routes/donations"));

app.use("/api/payment", paymentRoutes);


// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


