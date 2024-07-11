import { SOAP_URL } from "../config/dev.js";
import { soapClient } from "../index.js";
import axios from "axios";

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

    const [result] = await this.soapClient[methodName + "Async"](args);
    return result;
  }
}

export default new SoapService();
