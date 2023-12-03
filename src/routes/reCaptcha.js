const express = require("express");
const axios = require("axios");
require("dotenv").config();
const route = express.Router();

route.post("/verify", async (req, res) => {
  try {
    const { captchaValue } = req.body;
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SITE_SECRET}&response=${captchaValue}`
    );
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
