import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyTokenAndKey from "../middleware/verifyTokenKey.js";
import verifyUserID from "../middleware/verifyUserID.js";
import serverHelper from "../utils/server-helper.js";
import { commentModel, postModel, reportModel } from "../models/postModel.js";
import { userModel } from "../models/userModel.js";
import { Types } from "mongoose";
import { decrypt, encrypt } from "../utils/encrypt-decrypt.js";
import inputCheck from "../utils/input-check.js";

const route = Router();
const routeAll = Router();

// get all user posts
routeAll.get("/", verifyToken, verifyTokenAndKey, verifyUserID, (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query?.page ?? 0);
  const size = parseInt(req.query?.size ?? 5);
  const skip = page * size;

  serverHelper(async () => {
    let pipeline = [
      {
        $match: {
          author: new Types.ObjectId(userId),
        },
      },
      {
        $addFields: {
          id: {
            $toString: "$_id",
          },
        },
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          des: 0,
          author: 0,
        },
      },
    ];

    const totalCount = await postModel.find({ author: userId }, { _id: 1 });
    const data = await postModel
      .aggregate(pipeline)
      .skip(skip)
      .limit(size)
      .exec();

    const updateData = data?.map((ele) => ({
      ...ele,
      id: encrypt(ele.id),
    }));

    res.status(200).send({
      success: true,
      totalCount: totalCount.length,
      count: data.length,
      data: updateData,
    });
  }, res);
});

// get all posts
routeAll.get("/all", (req, res) => {
  const page = parseInt(req.query?.page ?? 0);
  const size = parseInt(req.query?.size ?? 10);
  const tag = req.query?.tag;
  const skip = page * size;
  serverHelper(async () => {
    const totalCount = await postModel.estimatedDocumentCount();
    let pipeline = [
      {
        $addFields: {
          voteDifference: {
            $subtract: ["$voteCount.upVote", "$voteCount.downVote"],
          },
          id: {
            $toString: "$_id",
          },
        },
      },
      {
        $sort: { voteDifference: -1 },
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          des: 0,
        },
      },
      {
        $lookup: {
          from: "users", // Collection name to lookup
          localField: "author", // Field in the post collection
          foreignField: "_id", // Field in the user collection
          as: "author", // Alias for the joined documents
          pipeline: [
            {
              $project: {
                _id: 0,
                userName: 1,
                userEmail: 1,
                userPhoto: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$author", // Deconstruct the author array created by $lookup
      },
    ];

    if (typeof tag !== "undefined" && tag !== "all") {
      pipeline.push({
        $match: {
          tags: {
            $elemMatch: {
              $eq: tag,
            },
          },
        },
      });
    }

    const data = await postModel
      .aggregate(pipeline)
      .skip(skip)
      .limit(size)
      .exec();

    const updateData = data?.map((ele) => ({
      ...ele,
      id: encrypt(ele.id),
    }));

    res.status(200).send({
      success: true,
      totalCount,
      count: data.length,
      data: updateData,
    });
  }, res);
});

// post search
routeAll.get("/search", (req, res) => {
  const query = req.query.q;
  serverHelper(async () => {
    const data = await postModel.find(
      { title: new RegExp(query, "ig") },
      { title: 1 }
    );
    const updateData = data?.map((ele) => ({
      title: ele.title,
      id: encrypt(ele.id),
    }));
    res.status(200).send({
      success: true,
      data: updateData,
    });
  }, res);
});

// create post route
route.post("/", verifyToken, verifyTokenAndKey, verifyUserID, (req, res) => {
  const userId = req.userId;

  const postData = req.body;
  const { title, des, tag } = postData;

  const check = inputCheck([title, des, tag], res);
  if (!check) {
    return;
  }

  serverHelper(async () => {
    const filter = {
      _id: userId,
      $or: [{ badge: "gold" }, { badge: "bronze", postCount: { $lt: 5 } }],
    };

    const userPostCountUpdate = await userModel.updateOne(filter, {
      $inc: { postCount: 1 },
    });

    if (userPostCountUpdate.modifiedCount === 0) {
      res.status(400).send({
        success: false,
        message: "You have limited post, please update your plan",
      });
      return;
    }

    const tags = tag.map((ele) => ele.toLowerCase());

    await postModel.create({ title, des, tags, author: userId });

    res.status(201).send({
      success: true,
      message: "Post is created",
    });
  }, res);
});

// get single public post
route.get("/:postId", (req, res) => {
  const postId = decrypt(req.params.postId);

  serverHelper(async () => {
    const data = await postModel.findOne({ _id: postId }, { __v: 0 }).populate({
      path: "author",
      select: ["userName", "userEmail", "userPhoto"],
    });

    const comments = await commentModel
      .find({ post: data.id }, { __v: 0, post: 0 })
      .populate({
        path: "user",
        select: ["userName", "userEmail", "userPhoto"],
      });

    const updateComments = comments?.map((ele) => ({
      id: encrypt(ele.id),
      user: {
        id: encrypt(ele.user.id),
        userName: ele.user.userName,
        userEmail: ele.user.userEmail,
        userPhoto: ele.user?.userPhoto,
      },
      details: ele.details,
      createdAt: ele.createdAt,
      updatedAt: ele.updatedAt,
    }));

    res.status(200).send({
      success: true,
      data: {
        voteCount: data?.voteCount,
        title: data.title,
        des: data.des,
        tags: data.tags,
        author: {
          id: encrypt(data.author.id),
          userName: data.author.userName,
          userEmail: data.author.userEmail,
          userPhoto: data.author?.userPhoto,
        },
        comments: updateComments,
        commentCount: data.commentCount,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  }, res);
});

// update post data
route.patch(
  "/update/:postId",
  verifyToken,
  verifyTokenAndKey,
  verifyUserID,
  (req, res) => {
    const postId = decrypt(req.params.postId);

    const postData = req.body;
    // if body is empty then block user
    if (Object.keys(postData).length <= 0) {
      res.status(400).send({ success: false, message: "invalid input data" });
      return;
    }

    // block user action if "commentCount" or "author" is try to update
    const notIncludeKeys = ["commentCount", "author"];
    const postDataKeys = Object.keys(postData);
    for (let x of notIncludeKeys) {
      if (postDataKeys.includes(x)) {
        res.status(400).send({
          success: false,
          message: `You can't update '${x}' field`,
        });
        return;
      }
    }

    serverHelper(async () => {
      const update = await postModel.updateOne(
        { _id: postId },
        { ...postData }
      );
      res.status(200).send({
        success: true,
        data: update,
      });
    }, res);
  }
);

// delete post
route.delete(
  "/delete/:postId",
  verifyToken,
  verifyTokenAndKey,
  verifyUserID,
  (req, res) => {
    const postId = decrypt(req.params.postId);
    const userId = req.userId;
    serverHelper(async () => {
      const data = await postModel.deleteOne({
        _id: postId,
        author: new Types.ObjectId(userId),
      });
      if (data.deletedCount === 0) {
        res
          .status(400)
          .send({ success: false, message: "Something went wrong" });
        return;
      }
      await userModel.updateOne({ _id: userId }, { $inc: { postCount: -1 } });

      await commentModel.deleteMany({
        post: new Types.ObjectId(postId),
      });

      await reportModel.deleteMany({
        post: new Types.ObjectId(postId),
      });

      res.status(200).send({
        success: true,
        data,
      });
    }, res);
  }
);

export default routeAll;
export { route as post };
