import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import appRouter from "./utils/appRouter.js";
import expressListEndpoints from "express-list-endpoints";

const PORT = 8082;

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

let server = null;

async function init() {
  try {
    await appRouter(app);
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(expressListEndpoints(app));
    });
  } catch (error) {
    console.error("Failed to initialize:", error);
    process.exit(1);
  }
}

init();

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
