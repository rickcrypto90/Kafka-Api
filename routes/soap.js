import express from "express";
import soapService from "../services/soapService.js";

const router = express.Router();

router.get("/methods", async (req, res) => {
  const methods = await soapService.getAvailableMethods();
  console.log("Available SOAP methods:", methods);
  res.json(methods);
});

router.post("/test", async (req, res) => {
  try {
    const response = await soapService.callSoapMethod(
      req.body.method,
      req.body.args
    );
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});

router.post("/products/add-product", async (req, res) => {
  try {
    const method = null;
    const response = await soapService.callSoapMethod(method, req.body.args);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});

router.post("/products/remove-product", async (req, res) => {
  try {
    const method = null;
    const response = await soapService.callSoapMethod(method, req.body.args);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});

export default router;
