import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import appRouter from "./utils/appRouter.js";
import expressListEndpoints from "express-list-endpoints";
import soap from "soap";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { PORT, SOAP_URL } from "./config/dev.js";
import KafkaConsumer from "./services/kafkaService.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.raw({
    type: function () {
      return true;
    },
    limit: "5mb",
  })
);
app.use(errorHandler);

let server = null;
let consumer = null;
let soapClient = null;

async function initKafkaConsumer() {
  try {
    consumer = new KafkaConsumer();
    await consumer.init();
    console.log("Kafka consumer initialized and started");
  } catch (error) {
    console.error("Failed to initialize Kafka consumer", { error });
    throw error;
  }
}

async function initSoapClient() {
  try {
    soapClient = await soap.createClientAsync(SOAP_URL, {
      forceSoap12Headers: false,
    });

    const description = soapClient.describe();

    console.log(
      "SOAP service description:",
      JSON.stringify(description, null, 2)
    );

    console.log("SOAP client initialized");
  } catch (error) {
    console.error("Failed to initialize SOAP client:", error);
  }
}

async function init() {
  try {
    await initSoapClient();
    await appRouter(app);
    // await initKafkaConsumer();

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
  console.log("Disconnecting consumer...");
  if (consumer) {
    consumer.disconnect();
  }
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export { soapClient };
