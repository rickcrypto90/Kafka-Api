// import { Kafka } from "kafkajs";
// import readline from "readline";

// const kafka = new Kafka({
//   clientId: "my-app",
//   brokers: ["0.tcp.eu.ngrok.io:18591"],
// });

// const producer = kafka.producer();
// const consumer = kafka.consumer({ groupId: "test-group" });

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// async function produceMessage(topic) {
//   return new Promise((resolve) => {
//     rl.question(
//       'Enter a message to send (or "exit" to quit): ',
//       async (input) => {
//         if (input.toLowerCase() === "exit") {
//           resolve(false);
//           return;
//         }

//         await producer.send({
//           topic: topic,
//           messages: [{ value: input }],
//         });

//         console.log(`Sent: ${input}`);
//         resolve(true);
//       }
//     );
//   });
// }

// async function run() {
//   await producer.connect();
//   await consumer.connect();

//   const topic = "my-topic";

//   await consumer.subscribe({ topic: topic, fromBeginning: true });

//   consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       if (!message.value) return;
//       console.log(`Received: ${message.value.toString()}`);
//     },
//   });

//   while (await produceMessage(topic)) {}

//   await producer.disconnect();
//   await consumer.disconnect();
//   rl.close();

//   const admin = kafka.admin();
//   await admin.connect();
//   const topics = await admin.listTopics();
//   console.log("Topics:", topics);

//   const metadata = await admin.fetchTopicMetadata({ topics: [topic] });
//   console.log("Metadata:", metadata);

//   await admin.disconnect();
// }

// run().catch(console.error);
