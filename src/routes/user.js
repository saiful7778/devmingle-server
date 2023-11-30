const express = require("express");
const { userColl } = require("../DB/mongodb");
const route = express.Router();

route.post("/", async (req, res) => {
  try {
    const userData = req.body;
    const result = await userColl.insertOne(userData);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
