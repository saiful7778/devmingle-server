import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyTokenAndKey from "../middleware/verifyTokenKey.js";
import verifyUserID from "../middleware/verifyUserID.js";
import serverHelper from "../utils/server-helper.js";
import inputCheck from "../utils/input-check.js";
import Stripe from "stripe";
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import dotenv from "dotenv";
dotenv.config();

const route = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

route.post(
  "/create_payment_intent",
  verifyToken,
  verifyTokenAndKey,
  verifyUserID,
  (req, res) => {
    const bodyData = req.body;
    const { price } = bodyData;
    const check = inputCheck([price], res);
    if (!check) return;
    if (typeof price !== "number") {
      res.status(400).send({
        success: false,
        message: "price must a number",
      });
      return;
    }
    serverHelper(async () => {
      const amount = parseInt(price) * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res
        .status(201)
        .send({ success: true, clientSecret: paymentIntent.client_secret });
    }, res);
  }
);

export default route;
