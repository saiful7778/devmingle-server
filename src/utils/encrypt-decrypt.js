import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const encryptionMethod = process.env.ECNRYPTION_METHOD;
const key = crypto
  .createHash("sha512")
  .update(process.env.SECRET_KEY)
  .digest("hex")
  .substring(0, 32);
const iv = crypto
  .createHash("sha512")
  .update(process.env.SECRET_IV)
  .digest("hex")
  .substring(0, 16);

export function encrypt(inputText) {
  try {
    let cipher = crypto.createCipheriv(encryptionMethod, key, iv);
    let encrypted = cipher.update(String(inputText));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function decrypt(encryptedText) {
  try {
    let decipher = crypto.createDecipheriv(encryptionMethod, key, iv);
    let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return false;
  }
}
