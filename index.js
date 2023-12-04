const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("./src/middleware/logger");
require("dotenv").config();

const jwtRoute = require("./src/routes/jwtAuth");
const userRoute = require("./src/routes/user");
const postRoute = require("./src/routes/post");
const announcementRoute = require("./src/routes/announcement");
const recaptchaRoute = require("./src/routes/reCaptcha");

const port = process.env.PORT || 5001;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://devmingle-forum.web.app"],
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", logger, (req, res) => {
  res.send({
    message: "Server is running",
  });
});

app.use("/jwt", jwtRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/captcha", recaptchaRoute);
app.use("/announcement", announcementRoute);

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
