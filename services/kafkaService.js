import Kafka from "node-rdkafka";
import { KAFKA_BROKERS, KAFKA_TOPICS, KAFKA_GROUP_ID } from "../config/dev.js";
import MessageProcessor from "./messageProcessorService.js";

class KafkaConsumer {
  constructor() {
    this.consumer = null;
    this.messageProcessor = new MessageProcessor();
  }

  async init() {
    try {
      this.consumer = await this.createConsumer();
      await this.setupConsumerEvents();
      console.info("Kafka consumer initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Kafka consumer", { error });
    }
  }

  createConsumer() {
    return new Promise((resolve, reject) => {
      const consumer = new Kafka.KafkaConsumer(
        {
          "group.id": KAFKA_GROUP_ID,
          "metadata.broker.list": KAFKA_BROKERS,
          "enable.auto.commit": false,
        },
        {}
      );

      consumer.connect();

      consumer.on("ready", () => {
        console.info("Kafka consumer ready");
        resolve(consumer);
      });

      consumer.on("event.error", (err) => {
        console.error("Kafka consumer error", { error: err });
      });
    });
  }

  async setupConsumerEvents() {
    this.consumer.subscribe(KAFKA_TOPICS);

    this.consumer.on("data", async (data) => {
      try {
        await this.processMessage(data);
      } catch (error) {
        console.error("Error processing message", { error, messageData: data });
      }
    });

    this.consumer.on("disconnected", (args) => {
      console.warn("Kafka consumer disconnected", { args });
    });

    this.consumer.consume();
  }

  async processMessage(data) {
    const message = data.value.toString();
    console.debug("Received message", {
      topic: data.topic,
      partition: data.partition,
      offset: data.offset,
    });

    try {
      const result = await this.messageProcessor.process(message);
      console.info("Message processed successfully", { result });
      await this.commitMessage(data);
    } catch (error) {
      console.error("Failed to process message", { error, message });
    }
  }

  async commitMessage(data) {
    return new Promise((resolve, reject) => {
      this.consumer.commitMessage(data, (err, topicPartitions) => {
        if (err) {
          console.error("Failed to commit message", {
            error: err,
            topicPartitions,
          });
        } else {
          console.debug("Message committed successfully", { topicPartitions });
          resolve(topicPartitions);
        }
      });
    });
  }

  async disconnect() {
    if (this.consumer) {
      console.info("Disconnecting Kafka consumer");
      return new Promise((resolve) => {
        this.consumer.disconnect((err, info) => {
          if (err) {
            logger.error("Error while disconnecting Kafka consumer", {
              error: err,
            });
          }
          console.info("Kafka consumer disconnected", { info });
          resolve();
        });
      });
    }
  }
}

export default KafkaConsumer;
