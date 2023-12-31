const express = require("express");
const {
  postColl,
  userColl,
  commentsColl,
  reportColl,
} = require("../DB/mongodb");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const { ObjectId } = require("mongodb");
const verifyAdmin = require("../middleware/verifyAdmin");
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

    res.status(200).send({ result, decrementPostCount });
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

route.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query?.page);
    const size = parseInt(req.query?.size);
    const tag = req.query?.tag;

    let pipeline;

    if (tag === "all") {
      pipeline = [
        {
          $addFields: {
            voteDifference: {
              $subtract: ["$voteCount.upVote", "$voteCount.downVote"],
            },
          },
        },
        {
          $sort: { voteDifference: -1 },
        },
      ];
    } else {
      pipeline = [
        {
          $addFields: {
            voteDifference: {
              $subtract: ["$voteCount.upVote", "$voteCount.downVote"],
            },
          },
        },
        {
          $sort: { voteDifference: -1 },
        },
        {
          $match: {
            tag: {
              $elemMatch: {
                $eq: tag,
              },
            },
          },
        },
      ];
    }

    const skip = page * size;

    const result = await postColl
      .aggregate(pipeline)
      .skip(skip)
      .limit(size)
      .toArray();

    const totalCount = await postColl.estimatedDocumentCount();
    res.status(200).send({ result, totalCount, count: result.length });
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.get("/all/search", async (req, res) => {
  try {
    const query = req.query.q;
    const filter = { title: new RegExp(query, "ig") };
    const result = await postColl
      .find(filter)
      .project({ title: 1, _id: 1 })
      .toArray();
    res.status(200).send(result.slice(0, 5));
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.get("/:postID", async (req, res) => {
  try {
    const postID = req.params.postID;

    const filter = { postID: postID };
    const query = { _id: new ObjectId(postID) };

    const comments = await commentsColl.find(filter).toArray();
    const result = await postColl.findOne(query);

    res.status(200).send({ content: result, comments });
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.get(
  "/:postID/comments",
  verifyToken,
  verifyTokenAndKey,
  async (req, res) => {
    try {
      const postID = req.params.postID;
      const filter = { postID: postID };
      const result = await commentsColl.find(filter).toArray();
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

route.post("/comment", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const body = req.body;
    const filter = { _id: new ObjectId(body.postID) };
    const updateCommentCount = await postColl.updateOne(filter, {
      $inc: { "comment.count": 1 },
    });
    const result = await commentsColl.insertOne(body);
    res.status(201).send({ result, updateCommentCount });
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

route.post(
  "/comment/:commentID/report",
  verifyToken,
  verifyTokenAndKey,
  async (req, res) => {
    try {
      // const commentID = req.params.commentID;
      const body = req.body;
      // const data = { commentID, ...body };
      const result = await reportColl.insertOne(body);
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

route.patch("/:postID", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const body = req.body;
    const postID = req.params.postID;
    const filter = { _id: new ObjectId(postID) };
    const updated = {
      $set: {
        "voteCount.upVote": body?.upVote,
        "voteCount.downVote": body?.downVote,
      },
    };
    const result = await postColl.updateOne(filter, updated);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

// comment reports route if request user is admin
route.get(
  "/admin/report",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  async (req, res) => {
    try {
      const result = await reportColl.find().toArray();
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

// delete report if request user is admin
route.delete(
  "/admin/report/:reportID",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  async (req, res) => {
    try {
      const reportID = req.params.reportID;
      const query = { _id: new ObjectId(reportID) };
      const result = await reportColl.deleteOne(query);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

module.exports = route;
