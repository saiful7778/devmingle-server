const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "invalid authentication" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized" });
    }
    req.user = decode;
    next();
  });
}

module.exports = verifyToken;
