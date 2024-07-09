import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import appRouter from "./utils/appRouter.js";
import expressListEndpoints from "express-list-endpoints";
import Kafka from "node-rdkafka";
import soap from "soap";
import {
  PORT,
  SOAP_URL,
  KAFKA_BROKER,
  KAFKA_TOPIC,
  KAFKA_GROUP_ID,
} from "./config/dev.js";

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

let server = null;
let consumer = null;
let soapClient = null;

function initKafkaConsumer() {
  return new Promise((resolve, reject) => {
    const consumer = new Kafka.KafkaConsumer(
      {
        "group.id": KAFKA_GROUP_ID,
        "metadata.broker.list": KAFKA_BROKER,
      },
      {}
    );

    consumer.connect();

    consumer.on("ready", () => {
      console.log("Kafka consumer ready");
      consumer.subscribe([KAFKA_TOPIC]);
      consumer.consume();
      resolve(consumer);
    });

    consumer.on("data", (data) => {
      // devo fare qualcosa con i dati ricevuti
    });

    consumer.on("event.error", (err) => {
      console.error("Error from consumer", err);
      reject(err);
    });
  });
}

async function initSoapClient() {
  try {
    soapClient = await soap.createClientAsync(SOAP_URL, {
      forceSoap12Headers: false,
    });

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
