import express from "express";
import cors from "cors";
import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import users, { user } from "./routes/user.js";
import { authentication } from "./routes/authentication.js";
import posts, { post } from "./routes/post.js";
import announcements, { announcement } from "./routes/announcement.js";
import { comment } from "./routes/comment.js";
import { captcha } from "./routes/reCaptcha.js";
import payment from "./routes/payment.js";

const dbUrl = process.env.DB_CONNECT;

(async () => {
  try {
    console.log("connecting...");
    await connect(dbUrl);
    console.log("connected DB");
  } catch (err) {
    console.log("connection failed");
    console.log(err);
  }
})();

const app = express();

app.use(
  cors({
    origin: ["https://devmingle-forum.web.app", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    success: true,
    message: `Server is running and request handle ${process.pid}`,
  });
});

app.use("/captcha", captcha);
app.use("/authentication", authentication);
app.use("/user", user);
app.use("/users", users);
app.use("/announcement", announcement);
app.use("/announcements", announcements);
app.use("/payment", payment);
app.use("/post", post);
app.use("/posts", posts);
app.use("/post/comment", comment);

export default app;
