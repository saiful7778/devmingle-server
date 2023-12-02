const express = require("express");
const { postColl, userColl } = require("../DB/mongodb");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const route = express.Router();

route.post("/:userID", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const userID = req.params.userID;
    const postData = req.body;

    const filter = {
      userToken: userID,
      $or: [{ badge: "bronze", postCount: { $lt: 5 } }, { badge: "gold" }],
    };
    const updatePostCount = await userColl.updateOne(filter, {
      $inc: { postCount: 1 },
    });
    if (updatePostCount.modifiedCount === 0) {
      return res.status(200).send({ message: false });
    }

    const result = await postColl.insertOne(postData);
    res.status(201).send({ message: true, result });
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
