import { Router } from "express";
import serverHelper from "../utils/server-helper.js";
import { userModel } from "../models/userModel.js";
import { commentModel, postModel, reportModel } from "../models/postModel.js";
import inputCheck from "../utils/input-check.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyTokenAndKey from "../middleware/verifyTokenKey.js";
import verifyUserId from "../middleware/verifyUserID.js";
import { Types } from "mongoose";
import { decrypt, encrypt } from "../utils/encrypt-decrypt.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import devDebug from "../utils/dev-debug.js";

const route = Router();
const routeAll = Router();

// user create route
route.post("/", (req, res) => {
  const userData = req.body;
  const { userName, userEmail, userToken, userPhoto } = userData;

  const check = inputCheck([userName, userEmail, userToken], res);
  if (!check) {
    return;
  }

  serverHelper(async () => {
    const exist = await userModel.findOne({ userEmail });
    if (exist) {
      res.status(400).send({
        success: false,
        message: "User is already exist",
      });
      return;
    }
    const result = await userModel.create({
      userName,
      userEmail,
      userPhoto,
      userToken,
    });
    res.status(201).send({
      success: true,
      data: {
        userName: result.userName,
        userEmail: result.userEmail,
        userPhoto: result.userPhoto,
        userToken: result.userToken,
        userRole: result.userRole,
        badge: result.badge,
        postCount: result.postCount,
      },
    });
  }, res);
});

// checking if user is admin or not
route.get(
  "/admin-check",
  verifyToken,
  verifyTokenAndKey,
  verifyUserId,
  (req, res) => {
    const userId = req.userId;
    serverHelper(async () => {
      const data = await userModel.findOne({ _id: userId }, { userRole: 1 });
      let admin = false;
      if (data) {
        admin = data?.userRole === "admin";
      }
      res.status(200).send({
        success: true,
        data: { admin },
      });
    }, res);
  }
);

// get single user data route
route.get(
  "/data/:userId",
  verifyToken,
  verifyTokenAndKey,
  verifyUserId,
  (req, res) => {
    const userId = decrypt(req.params.userId);
    serverHelper(async () => {
      const data = await userModel.findOne({ _id: userId }, { __v: 0 });

      res.status(200).send({
        success: true,
        data: {
          id: encrypt(data.id),
          userName: data.userName,
          userEmail: data.userEmail,
          userPhoto: data.userPhoto,
          userToken: data.userToken,
          userRole: data.userRole,
          badge: data.badge,
          postCount: data.postCount,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      });
    }, res);
  }
);

// get single user data route
route.get("/data/public/:userId", (req, res) => {
  const userId = decrypt(req.params.userId);
  serverHelper(async () => {
    const data = await userModel.findById(userId, { __v: 0 });

    res.status(200).send({
      success: true,
      data: {
        id: encrypt(data.id),
        userName: data.userName,
        userEmail: data.userEmail,
        userPhoto: data.userPhoto,
        userRole: data.userRole,
        badge: data.badge,
        postCount: data.postCount,
      },
    });
  }, res);
});

// make any user role admin route if request user is admin
route.patch(
  "/admin/make_admin/:userID",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  (req, res) => {
    const userID = decrypt(req.params.userID);
    serverHelper(async () => {
      const data = await userModel.updateOne(
        { _id: userID },
        { $set: { userRole: "admin" } },
        { upsert: true }
      );
      res.status(200).send({
        success: true,
        data,
      });
    }, res);
  }
);

route.patch(
  "/badge-update",
  verifyToken,
  verifyTokenAndKey,
  verifyUserId,
  (req, res) => {
    const userId = req.userId;
    serverHelper(async () => {
      const data = await userModel.updateOne(
        { _id: userId },
        {
          $set: {
            badge: "gold",
          },
        },
        { upsert: true }
      );
      res.status(200).send({ success: true, data });
    }, res);
  }
);

// delete a user account if requested user is admin
route.delete(
  "/admin/delete_account/:userID",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  (req, res) => {
    const userID = decrypt(req.params.userID);
    serverHelper(async () => {
      const deleteUser = await userModel.deleteOne({ _id: userID });
      if (deleteUser.deletedCount !== 1) {
        res
          .status(400)
          .send({ success: false, message: "something went wrong" });
        devDebug("user can not deleted");
        return;
      }
      const deletePosts = await postModel.deleteMany({
        author: new Types.ObjectId(userID),
      });

      const deleteComments = await commentModel.deleteMany({
        user: new Types.ObjectId(userID),
      });
      const deleteReport = await reportModel.deleteMany({
        reportUser: new Types.ObjectId(userID),
      });

      res.status(200).send({
        success: true,
        data: {
          user: deleteUser,
          post: deletePosts,
          comment: deleteComments,
          report: deleteReport,
        },
      });
    }, res);
  }
);

// get all user data (admin)
routeAll.get("/", verifyToken, verifyTokenAndKey, verifyAdmin, (req, res) => {
  serverHelper(async () => {
    const data = await userModel.find({}, { __v: 0 });

    const updateData = data?.map((ele) => ({
      id: encrypt(ele.id),
      userName: ele.userName,
      userEmail: ele.userEmail,
      userPhoto: ele.userPhoto,
      userRole: ele.userRole,
      badge: ele.badge,
      postCount: ele.postCount,
      createdAt: ele.createdAt,
      updatedAt: ele.updatedAt,
    }));

    res.status(200).send({
      success: true,
      data: updateData,
    });
  }, res);
});

export default routeAll;
export { route as user };
