
const crypto = require("crypto");

const generateCode = () => {
  return crypto.randomBytes(3).toString("hex"); // 6 char code
};

module.exports = generateCode;
