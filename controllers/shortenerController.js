const Url = require("../models/Url");
const Log = require("../middleware/logger");

// Create Short URL (shortcode must be provided manually)
exports.createShortUrl = async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    // ✅ Validate shortcode
    if (typeof shortcode !== "string" || shortcode.trim() === "") {
      await Log("backend", "error", "controller", "Shortcode is missing or invalid");
      return res.status(400).json({ error: "Shortcode is required and must be a non-empty string" });
    }

    const shortCode = shortcode.trim();
    const expiryDate = new Date(Date.now() + validity * 60000);

    const exists = await Url.findOne({ shortCode });
    if (exists) {
      await Log("backend", "error", "controller", "Shortcode already exists");
      return res.status(400).json({ error: "Shortcode already in use" });
    }

    const newUrl = new Url({
      originalUrl: url,
      shortCode,
      expiryDate,
    });

    await newUrl.save();
    await Log("backend", "info", "controller", `Shortcode created: ${shortCode}`);

    return res.status(201).json({
      shortLink: `http://localhost:5000/${shortCode}`,
      expiry: expiryDate.toISOString(),
    });
  } catch (err) {
    console.log("🔥 ERROR:", err);
    await Log("backend", "fatal", "controller", `Error creating short URL: ${err.message}`);
    res.status(500).json({ error: "Server error" });
  }
};

// Get stats for a short URL
exports.getStats = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const data = await Url.findOne({ shortCode: shortcode });

    if (!data) {
      await Log("backend", "warn", "controller", "Shortcode not found in stats");
      return res.status(404).json({ error: "Shortcode not found" });
    }

    return res.status(200).json({
      originalUrl: data.originalUrl,
      createdAt: data.createdAt,
      expiryDate: data.expiryDate,
      clickCount: data.clickCount,
      clicks: data.clicks,
    });
  } catch (err) {
    await Log("backend", "error", "controller", `Stats retrieval failed: ${err.message}`);
    res.status(500).json({ error: "Server error" });
  }
};

// Redirect to original URL
exports.redirect = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const record = await Url.findOne({ shortCode: shortcode });

    if (!record) {
      await Log("backend", "error", "route", "Redirection failed: shortcode not found");
      return res.status(404).json({ error: "Invalid URL" });
    }

    if (new Date() > record.expiryDate) {
      await Log("backend", "warn", "route", "Redirection failed: link expired");
      return res.status(410).json({ error: "Link expired" });
    }

    record.clickCount += 1;
    record.clicks.push({
      referrer: req.get("Referer") || "Direct",
      location: req.ip,
    });

    await record.save();
    res.redirect(record.originalUrl);
  } catch (err) {
    await Log("backend", "fatal", "route", `Redirection error: ${err.message}`);
    res.status(500).json({ error: "Internal error" });
  }
};
