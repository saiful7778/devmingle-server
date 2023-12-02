const express = require("express");
const { postColl, userColl } = require("../DB/mongodb");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const { ObjectId } = require("mongodb");
const route = express.Router();

route.post("/", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const { uid } = req.query;
    const postData = req.body;

    const filter = {
      userToken: uid,
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

route.delete("/:postID", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const { email, uid } = req.query;
    const postID = req.params.postID;
    const filter = { _id: new ObjectId(postID), "author.email": email };
    const decrementPostCount = await userColl.updateOne(
      { userEmail: email, userToken: uid },
      { $inc: { postCount: -1 } }
    );
    const result = await postColl.deleteOne(filter);
    res.send({ result, decrementPostCount });
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.get("/", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const { email } = req.query;
    const result = await postColl.find({ "author.email": email }).toArray();

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
