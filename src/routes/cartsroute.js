import mongoose from "mongoose";
import express from "express";
import Product from "../productModel.js";
import Cart from "../cartModel.js"; // Importamos el modelo de carrito

const router = express.Router();

router.post("/carts", async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "El array de productos no puede estar vacío" });
    }

    const updatedProducts = [];

    for (const item of products) {
      console.log("📩 ID recibido:", item.id);

      if (!item.id || !mongoose.Types.ObjectId.isValid(item.id)) {
        return res.status(400).json({ error: `El ID ${item.id} no es válido` });
      }

      const productId = new mongoose.Types.ObjectId(item.id);
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: `Producto con ID ${item.id} no encontrado` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para el producto ${product.title}` });
      }

      // Restar la cantidad del stock
      product.stock -= item.quantity;
      await product.save();

      updatedProducts.push({ id: product._id, quantity: item.quantity });
    }

    // Guardar el carrito en la base de datos
    const newCart = new Cart({ products: updatedProducts });
    await newCart.save();

    res.status(201).json({ message: "Carrito creado con éxito", cart: newCart });

  } catch (error) {
    console.error("❌ Error al crear el carrito:", error);
    res.status(500).json({ error: "Error al crear el carrito", details: error.message });
  }
});

export default router;
