const { userColl } = require("../DB/mongodb");

async function verifyAdmin(req, res, next) {
  try {
    const { email } = req.query;
    const query = { userEmail: email };
    const user = await userColl.findOne(query);
    const isAdmin = user?.userRole === "admin";
    if (!isAdmin) {
      return res.status(403).send({ message: "forbidden access" });
    }
    next();
  } catch (err) {
    res.status(500).send("an error occurred");
  }
}

module.exports = verifyAdmin;
