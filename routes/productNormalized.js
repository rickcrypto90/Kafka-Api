import express from "express";
import productService from "../services/productService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await productService.getProducts();
  res.json(products);
});

export default router;
