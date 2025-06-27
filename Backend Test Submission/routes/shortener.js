
const express = require("express");
const router = express.Router();
const {
  createShortUrl,
  getStats,
  redirect,
} = require("../controllers/shortenerController");

router.post("/shorturls", createShortUrl);
router.get("/shorturls/:shortcode", getStats);
router.get("/:shortcode", redirect);

module.exports = router;
