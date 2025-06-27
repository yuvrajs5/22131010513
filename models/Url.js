const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: String,
  location: String,
});

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: {
    type: String,
    required: [true, "Shortcode is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return typeof v === "string" && v.trim().length > 0;
      },
      message: "Shortcode must be a non-empty string",
    },
  },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  clickCount: { type: Number, default: 0 },
  clicks: [clickSchema],
});

module.exports = mongoose.model("Url", urlSchema);
