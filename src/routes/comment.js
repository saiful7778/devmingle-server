import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyTokenAndKey from "../middleware/verifyTokenKey.js";
import verifyUserID from "../middleware/verifyUserID.js";
import serverHelper from "../utils/server-helper.js";
import inputCheck from "../utils/input-check.js";
import { commentModel, postModel, reportModel } from "../models/postModel.js";
import { decrypt, encrypt } from "../utils/encrypt-decrypt.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const route = Router();

// create comment of post
route.post(
  "/:postId",
  verifyToken,
  verifyTokenAndKey,
  verifyUserID,
  (req, res) => {
    const postId = decrypt(req.params.postId);
    const userId = req.userId;
    const bodyData = req.body;
    const { details } = bodyData;
    const check = inputCheck([details], res);
    if (!check) {
      return;
    }
    serverHelper(async () => {
      await commentModel.create({
        post: postId,
        user: userId,
        details,
      });
      await postModel.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
      res.status(201).send({ success: true, message: "Comment is created" });
    }, res);
  }
);

// create comment report
route.post(
  "/:postId/report",
  verifyToken,
  verifyTokenAndKey,
  verifyUserID,
  (req, res) => {
    const postId = req.params.postId;
    const userId = req.userId;

    const reportData = req.body;
    const { comment, feedback } = reportData;
    const check = inputCheck([comment, feedback], res);
    if (!check) {
      return;
    }
    serverHelper(async () => {
      await reportModel.create({
        feedback,
        comment: decrypt(comment),
        post: decrypt(postId),
        reportUser: userId,
      });
      res.status(201).send({
        success: true,
        message: "Report is created",
      });
    }, res);
  }
);

// get all report data. It is admin access route
route.get(
  "/admin/reports",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  (req, res) => {
    serverHelper(async () => {
      const data = await reportModel
        .find({}, { __v: 0 })
        .populate({
          path: "comment",
          select: ["details", "user"],
          populate: { path: "user", select: ["userName", "userEmail"] },
        })
        .populate({ path: "post", select: "title" })
        .populate({ path: "reportUser", select: ["userEmail", "userName"] });

      const updateData = data?.map((ele) => ({
        id: encrypt(ele.id),
        feedback: ele.feedback,
        comment: {
          id: encrypt(ele.comment.id),
          details: ele.comment.details,
          user: {
            id: encrypt(ele.comment.user.id),
            userName: ele.comment.user.userName,
            userEmail: ele.comment.user.userEmail,
          },
        },
        post: {
          id: encrypt(ele.post.id),
          title: ele.post.title,
        },
        reportUser: {
          id: encrypt(ele.reportUser.id),
          userName: ele.reportUser.userName,
          userEmail: ele.reportUser.userEmail,
        },
        createdAt: ele.createdAt,
        updatedAt: ele.updatedAt,
      }));

      res.status(200).send({
        success: true,
        data: updateData,
      });
    }, res);
  }
);

// delete report data
route.delete(
  "/admin/report/:reportId",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  (req, res) => {
    const reportId = decrypt(req.params.reportId);
    serverHelper(async () => {
      const data = await reportModel.deleteOne({ _id: reportId });
      if (data.deletedCount === 0) {
        res
          .status(400)
          .send({ success: false, message: "Something went wrong" });
        return;
      }
      res.status(200).send({
        success: true,
        data,
      });
    }, res);
  }
);

export { route as comment };
