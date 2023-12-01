const express = require("express");
const { postColl } = require("../DB/mongodb");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const route = express.Router();

route.post("/", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const postData = req.body;
    const result = await postColl.insertOne(postData);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
