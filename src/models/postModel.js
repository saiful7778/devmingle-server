import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    des: {
      type: String,
      required: [true, "Description is required"],
    },
    tags: [
      {
        type: String,
        required: [true, "Tag is required"],
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    voteCount: {
      upVote: {
        type: Number,
        default: 0,
      },
      downVote: {
        type: Number,
        default: 0,
      },
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const postModel = model("post", postSchema);

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    details: {
      type: String,
      required: [true, "Details is required"],
    },
  },
  { timestamps: true }
);

export const commentModel = model("comment", commentSchema);

const reportSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
      required: true,
    },
    feedback: {
      type: String,
      required: [true, "Feedback is required"],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    reportUser: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const reportModel = model("report", reportSchema);
