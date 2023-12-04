const express = require("express");
const { userColl, postColl } = require("../DB/mongodb");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const { ObjectId } = require("mongodb");
const verifyAdmin = require("../middleware/verifyAdmin");
const route = express.Router();

// create new user data
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

// get single user details
route.get("/:userID", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const userID = req.params.userID;
    const result = await userColl.findOne({ userToken: userID });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

// delete a user account if requested user is admin
route.delete(
  "/admin/delete_account/:userID",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  async (req, res) => {
    try {
      const userID = req.params.userID;
      const { userEmail } = req.query;
      const query = { _id: new ObjectId(userID), userEmail };
      const deletePosts = await postColl.deleteMany({
        "author.email": userEmail,
      });
      const result = await userColl.deleteOne(query);
      res.status(200).send({ result, deletePosts });
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

// make any user role admin route if request user is admin
route.patch(
  "/admin/make_admin/:userID",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  async (req, res) => {
    try {
      const userID = req.params.userID;
      const { userEmail } = req.body;
      const filter = { _id: new ObjectId(userID), userEmail };
      const updateRole = {
        $set: { userRole: "admin" },
      };
      const result = await userColl.updateOne(filter, updateRole, {
        upsert: true,
      });
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

// get all user data route if request user in admin
route.get(
  "/admin/all",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  async (req, res) => {
    try {
      const result = await userColl.find().toArray();
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

// checking route if user is admin or not
route.get("/admin/check", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const { email } = req.query;
    const user = await userColl.findOne({ userEmail: email });
    let admin = false;
    if (user) {
      admin = user?.userRole === "admin";
    }
    res.status(200).send({ admin });
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
