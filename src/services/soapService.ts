import { Client, createClientAsync, ClientSSLSecurity } from 'soap';
import { config } from '../config';
import { AppError } from '../middleware/errorMiddleware';


interface SoapMethodArgs {
  [key: string]: any;
}

class SoapService {
  private client: Client | null = null;

  async init(url: string = config.SOAP_URL): Promise<void> {
    try {
      const wsdlOptions = {
        overrideRootElement: {
          namespace: 'xmlns:soapenv',
          xmlnsAttributes: [
            {
              name: 'xmlns:soapenv',
              value: 'http://schemas.xmlsoap.org/soap/envelope/',
            },
            {
              name: 'xmlns:soap',
              value: 'http://example.com/soap-web-service',
            },
          ],
        },
        envelopeKey: 'soapenv',
        xmlKey: '$xml',
      };

      this.client = await createClientAsync(url, { wsdl_options: wsdlOptions });

      this.client.on('request', (xml: string) => {
        console.log('SOAP request:', xml);
      });

      this.client.on('response', (xml: string) => {
        console.log('SOAP response:', xml);
      });

      console.log('SOAP client initialized');
    } catch (error) {
      console.error('Failed to initialize SOAP client:', error);
      throw new AppError('Failed to initialize SOAP client', 500, 'SOAP_INIT_ERROR');
    }
  }

  async getAvailableMethods(): Promise<object> {
    if (!this.client) {
      throw new AppError('SOAP client not initialized', 500, 'SOAP_CLIENT_ERROR');
    }
    return this.client.describe();
  }

  async callSoapMethod(methodName: string, args: SoapMethodArgs): Promise<any> {
    if (!this.client) {
      throw new AppError('SOAP client not initialized', 500, 'SOAP_CLIENT_ERROR');
    }

    if (!(methodName + 'Async' in this.client)) {
      throw new AppError(`Method ${methodName} not found`, 400, 'SOAP_METHOD_NOT_FOUND');
    }

    try {
      const [result] = await (this.client[methodName + 'Async'] as Function)(args);
      return result;
    } catch (error) {
      console.error(`Error calling SOAP method ${methodName}:`, error);
      throw new AppError(`Error calling SOAP method ${methodName}`, 500, 'SOAP_METHOD_ERROR');
    }
  }
}

export default new SoapService();