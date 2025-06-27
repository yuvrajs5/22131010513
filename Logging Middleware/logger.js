
const axios = require("axios");

const Log = async (stack, level, packageName, message) => {
  try {
    await axios.post("http://28.244.56.144/evaluation-service/logs", {
      stack,
      level,
      package: packageName,
      message
    });
  } catch (err) {
    // Avoid console logging as per requirement
  }
};

module.exports = Log;
