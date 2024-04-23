import devDebug from "../utils/dev-debug.js";

export default function verifyTokenAndKey(req, res, next) {
  const tokenUser = req.user;
  const keyEmail = req.query?.email;
  if (!keyEmail) {
    res.status(401).send({ success: false, message: "Unauthorized" });
    devDebug("query email is unavailable");
    return;
  }
  if (tokenUser?.userEmail !== keyEmail) {
    res.status(401).send({ success: false, message: "Unauthorized" });
    devDebug("token user email and query email is not match");
    return;
  }
  next();
}
