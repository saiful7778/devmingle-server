function verifyTokenAndKey(req, res, next) {
  const tokenUser = req.user;
  const keyEmail = req.query?.email;
  if (tokenUser?.email !== keyEmail) {
    return res.status(401).send({ message: "not accessible" });
  } else {
    next();
  }
}

module.exports = verifyTokenAndKey;
