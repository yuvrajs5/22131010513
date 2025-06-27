const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

const shortenerRoutes = require("./routes/shortener");
app.use("/", shortenerRoutes);

// ✅ Correct way to connect to MongoDB with Mongoose v8+
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // No callback!
    console.log("✅ MongoDB connected");
    app.listen(5000, () => {
      console.log("🚀 Server running on http://localhost:5000");
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit the app if DB fails to connect
  }
};

startServer();
