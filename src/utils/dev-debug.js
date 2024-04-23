import dotenv from "dotenv";
dotenv.config();

export default function devDebug(inputText) {
  if (process.env.NODE_ENV !== "production") {
    console.log("debug:", inputText);
  }
}
