import devDebug from "./dev-debug.js";

export default async function serverHelper(inputFunction, res) {
  try {
    await inputFunction();
  } catch (err) {
    devDebug(err);
    res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
}
