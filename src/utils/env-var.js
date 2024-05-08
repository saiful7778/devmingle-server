import dotenv from "dotenv";
dotenv.config();

const envVars = {
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  FORNTEND_URL: process.env.FORNTEND_URL,
  SITE_SECRET: process.env.SITE_SECRET,
  DB_CONNECT: process.env.DB_CONNECT,
  SECRET_KEY: process.env.SECRET_KEY,
  SECRET_IV: process.env.SECRET_IV,
  ECNRYPTION_METHOD: process.env.ECNRYPTION_METHOD,
  RUN_ENV: process.env.RUN_ENV,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
};

export default function getEnvVar(varName) {
  if (typeof envVars[varName] === "undefined") {
    console.error(`'${varName}' is not available`);
    process.exit();
  } else {
    return envVars[varName];
  }
}
