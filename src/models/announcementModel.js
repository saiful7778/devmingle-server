import { Schema, model } from "mongoose";

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    details: {
      type: String,
      required: [true, "Details is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const announcementModel = model("announcement", announcementSchema);
