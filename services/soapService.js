import { soapClient } from "../index.js";

class SoapService {
  constructor() {
    this.soapClient = soapClient;
  }

  async getAvailableMethods() {
    if (!this.soapClient) {
      throw new Error("No SOAP client");
    }
    return this.soapClient.describe();
  }

  async callSoapMethod(methodName, args) {
    if (!this.soapClient) {
      throw new Error("No SOAP client");
    }
    return new Promise((resolve, reject) => {
      this.soapClient[methodName](args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default new SoapService();
