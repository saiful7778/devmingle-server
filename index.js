import mainApp from "./src/app.js";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import getEnvVar from "./src/utils/env-var.js";

if (getEnvVar("RUN_ENV") === "cluster") {
  const numCPUs = availableParallelism();

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    const port = getEnvVar("PORT") ?? 5001;
    const app = mainApp();

    app.listen(port, () => {
      console.log("Server is running on port:", port);
    });
  }
} else {
  const port = getEnvVar("PORT") ?? 5001;
  const app = mainApp();

  app.listen(port, () => {
    console.log("Server is running on port:", port);
  });
}
