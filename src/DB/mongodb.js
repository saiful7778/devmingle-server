const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.CONNECT_LINK;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const devMingleDB = client.db("devMingleDB");
const userColl = devMingleDB.collection("users");
const postColl = devMingleDB.collection("posts");
const commentsColl = devMingleDB.collection("comments");
const reportColl = devMingleDB.collection("reports");
const announcementColl = devMingleDB.collection("announcement");

module.exports = {
  userColl,
  postColl,
  commentsColl,
  reportColl,
  announcementColl,
};
