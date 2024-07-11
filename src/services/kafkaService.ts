import Kafka from 'node-rdkafka';
import { config } from '../config';
import MessageProcessor from './messageProcessorService';
import { AppError } from '../middleware/errorMiddleware';


class KafkaConsumer {
  private consumer: Kafka.KafkaConsumer | null = null;
  private messageProcessor: MessageProcessor;

  constructor() {
    this.messageProcessor = new MessageProcessor();
  }

  async init(): Promise<void> {
    try {
      this.consumer = await this.createConsumer();
      await this.setupConsumerEvents();
      console.info('Kafka consumer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Kafka consumer', { error });
      throw new AppError('Failed to initialize Kafka consumer', 500, 'KAFKA_INIT_ERROR');
    }
  }

  private createConsumer(): Promise<Kafka.KafkaConsumer> {
    return new Promise((resolve, reject) => {
      const consumer = new Kafka.KafkaConsumer(
        {
          'group.id': config.KAFKA_GROUP_ID,
          'metadata.broker.list': config.KAFKA_BROKERS.join(','),
          'enable.auto.commit': false,
        },
        {}
      );

      consumer.connect();

      consumer.on('ready', () => {
        console.info('Kafka consumer ready');
        resolve(consumer);
      });

      consumer.on('event.error', (err) => {
        console.error('Kafka consumer error', { error: err });
        reject(new AppError('Kafka consumer error', 500, 'KAFKA_CONSUMER_ERROR'));
      });
    });
  }

  private async setupConsumerEvents(): Promise<void> {
    if (!this.consumer) {
      throw new AppError('Kafka consumer not initialized', 500, 'KAFKA_CONSUMER_ERROR');
    }

    this.consumer.subscribe(config.KAFKA_TOPICS);

    this.consumer.on('data', async (data: Kafka.Message) => {
      try {
        await this.processMessage(data);
      } catch (error) {
        console.error('Error processing message', { error, messageData: data });
      }
    });

    this.consumer.on('disconnected', (args: any) => {
      console.warn('Kafka consumer disconnected', { args });
    });

    this.consumer.consume();
  }

  private async processMessage(data: Kafka.Message): Promise<void> {
    const message = data.value?.toString() || '';
    console.debug('Received message', {
      topic: data.topic,
      partition: data.partition,
      offset: data.offset,
    });

    try {
      const result = await this.messageProcessor.process(message);
      console.info('Message processed successfully', { result });
      await this.commitMessage(data);
    } catch (error) {
      console.error('Failed to process message', { error, message });
    }
  }

  private async commitMessage(data: Kafka.Message): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.consumer) {
        reject(new AppError('Kafka consumer not initialized', 500, 'KAFKA_CONSUMER_ERROR'));
        return;
      }
      resolve(this.consumer.commitMessage(data));
    });
  }

  async disconnect(): Promise<void> {
    if (this.consumer) {
      console.info('Disconnecting Kafka consumer');
      return new Promise((resolve) => {
        this.consumer!.disconnect((err, info) => {
          if (err) {
            console.error('Error while disconnecting Kafka consumer', { error: err });
          }
          console.info('Kafka consumer disconnected', { info });
          resolve();
        });
      });
    }
  }
}

export default KafkaConsumer;