import express from "express";
import soapService from "../services/soapService.js";

const router = express.Router();

router.get("/methods", async (_, res) => {
  const methods = await soapService.getAvailableMethods();
  console.log("Available SOAP methods:", JSON.stringify(methods, null, 2));
  res.json(methods);
});

router.post("/test", async (req, res, next) => {
  try {
    const response = await soapService.callSoapMethod(
      req.body.method,
      req.body.args
    );
    res.json(response);
  } catch (err) {
    next(err);
  }
});


    // Da cambiare coi metodi espoti dai servizi SOAP di Antonino

router.post("/products/add-product", async (req, res) => {
  try {

    const method = null;
    const response = await soapService.callSoapMethod(method, req.body.args);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post("/products/remove-product", async (req, res) => {
  try {
    const method = null;
    const response = await soapService.callSoapMethod(method, req.body.args);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
