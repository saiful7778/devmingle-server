import { Router } from "express";
import axios from "axios";
import serverHelper from "../utils/server-helper.js";
import getEnvVar from "../utils/env-var.js";

const route = Router();

route.post("/verify", (req, res) => {
  const { captchaValue } = req.body;
  serverHelper(async () => {
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${getEnvVar(
        "SITE_SECRET"
      )}&response=${captchaValue}`
    );
    res.status(200).send({ success: true, data });
  }, res);
});

export { route as captcha };
