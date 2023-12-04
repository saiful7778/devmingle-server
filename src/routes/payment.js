const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const { userColl } = require("../DB/mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const route = express.Router();

route.post(
  "/create_intent",
  verifyToken,
  verifyTokenAndKey,
  async (req, res) => {
    try {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.status(200).send({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      res.status(500).send("an error occurred");
    }
  }
);

route.patch("/", verifyToken, verifyTokenAndKey, async (req, res) => {
  try {
    const { email } = req.query;
    const filter = { userEmail: email };
    const updateBadge = {
      $set: {
        badge: "gold",
      },
    };
    const result = await userColl.updateOne(filter, updateBadge, {
      upsert: true,
    });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("an error occurred");
  }
});

module.exports = route;
