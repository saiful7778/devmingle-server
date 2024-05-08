import jwt from "jsonwebtoken";
import devDebug from "../utils/dev-debug.js";
import getEnvVar from "../utils/env-var.js";

export default function verifyToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).send({ success: false, message: "Unauthorized" });
    devDebug("authorization headers is unavailable");
    return;
  }
  const token = authorization.split(" ")[1];
  if (!token) {
    res.status(401).send({ success: false, message: "Unauthorized" });
    devDebug("authorization token is unavailable");
    return;
  }
  // eslint-disable-next-line no-undef
  jwt.verify(token, getEnvVar("ACCESS_TOKEN"), (err, decode) => {
    if (err) {
      res.status(401).send({ success: false, message: "Unauthorized" });
      devDebug("token is not valid");
      return;
    }
    req.user = decode;
    next();
  });
}
