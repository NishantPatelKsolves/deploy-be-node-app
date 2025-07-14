const jwt = require("jsonwebtoken");
const generateJWTToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  });
};

module.exports = {
  generateJWTToken,
};
