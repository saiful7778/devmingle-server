import express from "express";
import jwt from "jsonwebtoken";
import serverHelper from "../utils/server-helper.js";
import dotenv from "dotenv";
import { userModel } from "../models/userModel.js";
import { encrypt } from "../utils/encrypt-decrypt.js";
import inputCheck from "../utils/input-check.js";
dotenv.config();

const route = express.Router();

// login route
route.post("/login", (req, res) => {
  const userData = req.body;
  const { userEmail } = userData;

  const check = inputCheck([userEmail], res);
  if (!check) {
    return;
  }

  serverHelper(async () => {
    const user = await userModel.findOne(
      { userEmail },
      {
        userEmail: 1,
        userToken: 1,
        userRole: 1,
        badge: 1,
      }
    );
    if (!user) {
      res.status(400).send({
        success: false,
        message: "User doesn't exist",
      });
      return;
    }

    const userData = {
      _id: encrypt(user._id),
      userEmail: user.userEmail,
      userToken: user.userToken,
      userRole: user.userRole,
      badge: user.badge,
    };

    const token = jwt.sign(
      {
        userEmail: user.userEmail,
        userToken: user.userToken,
        userRole: user.userRole,
        badge: user.badge,
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "1h" }
    );
    res.status(200).send({ success: true, token, userData });
  }, res);
});

export { route as authentication };
