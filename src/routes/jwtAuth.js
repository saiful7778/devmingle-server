const express = require("express");
const jwt = require("jsonwebtoken");

const route = express.Router();

route.post("/", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});

route.post("/logout", async (req, res) => {
  res
    .clearCookie("token", { maxAge: 0, secure: false })
    .send({ success: true });
});

module.exports = route;
