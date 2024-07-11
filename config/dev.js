// SERVER
const PORT = 8082;

//SOAP
const SOAP_URL =
  "http://localhost:8080/ws/produService.wsdl";

// const SOAP_URL =
//   "https://730f-37-180-61-166.ngrok-free.app/ws/produService.wsdl";

// KAFKA
const KAFKA_BROKERS = ["2.tcp.ngrok.io:18248"];
const KAFKA_TOPICS = ["my-topic"];
const KAFKA_GROUP_ID = "my-group";

export { PORT, SOAP_URL, KAFKA_BROKERS, KAFKA_TOPICS, KAFKA_GROUP_ID };
