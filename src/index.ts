import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import expressListEndpoints from 'express-list-endpoints';
import KafkaConsumer from './services/kafkaService';
import SoapService from './services/soapService';
import appRouter from './utils/appRouter';
import { config } from './config';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

const { PORT, SOAP_URL } = config;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({
  type: () => true,
  limit: '5mb'
}));
app.use(errorHandler);

let server: ReturnType<typeof app.listen> | null = null;
let consumer: KafkaConsumer | null = null;

async function initKafkaConsumer(): Promise<void> {
  try {
    consumer = new KafkaConsumer();
    await consumer.init();
    console.log('Kafka consumer initialized and started');
  } catch (error) {
    console.error('Failed to initialize Kafka consumer', { error });
    throw error;
  }
}

async function initSoapClient(): Promise<void> {
  try {
    await SoapService.init(SOAP_URL);
    console.log('SOAP client initialized');
  } catch (error) {
    console.error('Failed to initialize SOAP client:', error);
  }
}

async function init(): Promise<void> {
  try {
    await initSoapClient();
    await appRouter(app);
    // await initKafkaConsumer();

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(expressListEndpoints(app));
    });
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
}

init();

process.on('SIGINT', () => {
  console.log('Disconnecting consumer...');
  if (consumer) {
    consumer.disconnect();
  }
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  }
});

export { app };