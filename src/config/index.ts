import dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: number;
  SOAP_URL: string;
  KAFKA_BROKERS: string[];
  KAFKA_TOPICS: string[];
  KAFKA_GROUP_ID: string;
}

const config: Config = {
  PORT: parseInt(process.env.PORT || '8082', 10),
  SOAP_URL: process.env.SOAP_URL || 'http://localhost:8080/ws/produService.wsdl',
  KAFKA_BROKERS: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
  KAFKA_TOPICS: process.env.KAFKA_TOPICS ? process.env.KAFKA_TOPICS.split(',') : ['my-topic'],
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'my-group',
};

export { config }