import express from "express";
import soapService from "../services/soapService.js";
import { SOAP_URL } from "../config/dev.js";
import axios from "axios";

const router = express.Router();

router.get("/methods", async (_, res) => {
  const methods = await soapService.getAvailableMethods();
  console.log("Available SOAP methods:", JSON.stringify(methods, null, 2));
  res.json(methods);
});

router.post("/test", async (req, res, next) => {
  try {
    const response = await soapService.callSoapMethod();

    return true;
    // req.body.method,
    // req.body.args
    // ();
    // res.json(response);
  } catch (err) {
    next(err);
  }
});

// Da cambiare coi metodi espoti dai servizi SOAP di Antonino

router.post("/products/add-quantity", async (req, res, next) => {
  try {
    const method = "IncreaseQuantity";
    const response = await soapService.callSoapMethod(method, req.body.args);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post("/products/remove-quantity", async (req, res, next) => {
  try {
    const method = "DecreaseQuantity";
    const response = await soapService.callSoapMethod(method, req.body.args);
    res.json(response);
  } catch (err) {
    next(err);
  }
});
router.post("/products/add-product", async (req, res, next) => {
  try {
    const method = "AddProduct";
    const response = await soapService.callSoapMethod(method, req.body.args);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
