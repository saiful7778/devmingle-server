const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const verifyAdmin = require("../middleware/verifyAdmin");
const { announcementColl } = require("../DB/mongodb");
const { ObjectId } = require("mongodb");
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

route.get("/count", async (req, res) => {
  try {
    const count = await announcementColl.estimatedDocumentCount();
    res.status(200).send({ count });
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.get("/", async (req, res) => {
  try {
    const result = await announcementColl.find().toArray();
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.delete(
  "/:announcementID",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  async (req, res) => {
    try {
      const announcementID = req.params.announcementID;
      const query = { _id: new ObjectId(announcementID) };
      const result = await announcementColl.deleteOne(query);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

module.exports = route;
