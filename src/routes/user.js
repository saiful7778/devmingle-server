const express = require("express");
const { userColl } = require("../DB/mongodb");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const { ObjectId } = require("mongodb");
const route = express.Router();

route.post("/", async (req, res) => {
  try {
    const userData = req.body;
    const filter = { userEmail: userData.userEmail };
    const insertUser = {
      $set: {
        ...userData,
      },
    };
    const result = await userColl.updateOne(filter, insertUser, {
      upsert: true,
    });
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.get("/all", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const result = await userColl.find().toArray();
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.get("/:userID", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const userID = req.params.userID;
    const result = await userColl.findOne({ userToken: userID });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.delete("/:userID", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const userID = req.params.userID;
    const { uid } = req.query;
    const query = { _id: new ObjectId(userID), userToken: uid };
    const result = await userColl.findOne(query);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
