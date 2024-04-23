import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyTokenAndKey from "../middleware/verifyTokenKey.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import serverHelper from "../utils/server-helper.js";
import inputCheck from "../utils/input-check.js";
import { announcementModel } from "../models/announcementModel.js";
import { decrypt, encrypt } from "../utils/encrypt-decrypt.js";

const route = Router();
const routeAll = Router();

// create announcement
route.post("/", verifyToken, verifyTokenAndKey, verifyAdmin, (req, res) => {
  const bodyData = req.body;
  const authorId = req.userId;

  const { title, details } = bodyData;
  const check = inputCheck([title, details], res);
  if (!check) return;

  serverHelper(async () => {
    await announcementModel.create({ title, details, author: authorId });

    res.status(201).send({
      success: true,
      message: "accouncement is created",
    });
  }, res);
});

// get anncouncement count
routeAll.get("/count", (req, res) => {
  serverHelper(async () => {
    const count = await announcementModel.estimatedDocumentCount();
    res.status(200).send({
      success: true,
      data: { count },
    });
  }, res);
});

// get all announcement
routeAll.get("/", (req, res) => {
  serverHelper(async () => {
    const data = await announcementModel
      .find({}, { __v: 0 })
      .populate("author", ["userName", "userEmail"]);

    const updateData = data?.map((ele) => ({
      id: encrypt(ele.id),
      title: ele.title,
      details: ele.details,
      author: {
        id: encrypt(ele.author.id),
        userName: ele.author.userName,
        userEmail: ele.author.userEmail,
      },
    }));

    res.status(200).send({
      success: true,
      data: updateData,
    });
  }, res);
});

route.delete(
  "/:announcementID",
  verifyToken,
  verifyTokenAndKey,
  verifyAdmin,
  (req, res) => {
    const announcementID = decrypt(req.params.announcementID);
    serverHelper(async () => {
      const data = await announcementModel.deleteOne({ _id: announcementID });
      res.status(200).send({
        success: true,
        data,
      });
    }, res);
  }
);

export default routeAll;
export { route as announcement };
