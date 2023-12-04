const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const verifyAdmin = require("../middleware/verifyAdmin");
const { announcementColl } = require("../DB/mongodb");
const route = express.Router();

route.post(
  "/",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  async (req, res) => {
    try {
      const data = req.body;
      const result = await announcementColl.insertOne(data);
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

module.exports = route;
