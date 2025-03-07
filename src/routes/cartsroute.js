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

// GET - Obtener un carrito por su _id
router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params; // Obtener el ID desde los parámetros

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: "ID de carrito no válido" });
    }

    const cart = await Cart.findById(cid).populate("products.id"); // Popular productos

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart);
  } catch (error) {
    console.error("❌ Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error al obtener el carrito", details: error.message });
  }
});

// POST - Agregar un producto a un carrito
router.post("/carts/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; // La cantidad que se restará del stock

    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ error: "ID de carrito o producto no válido" });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    // Buscar el carrito y el producto
    const cart = await Cart.findById(cid);
    const product = await Product.findById(pid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: `Stock insuficiente para el producto ${product.title}` });
    }

    // Verificar si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(item => item.id.equals(product._id));

    if (productIndex !== -1) {
      // Si ya existe, aumentar la cantidad
      cart.products[productIndex].quantity += quantity;
    } else {
      // Si no existe, agregar el producto al carrito
      cart.products.push({ id: product._id, quantity });
    }

    // Reducir el stock del producto
    product.stock -= quantity;

    // Guardar los cambios
    await cart.save();
    await product.save();

    res.json({ message: "Producto agregado al carrito", cart });

  } catch (error) {
    console.error("❌ Error al agregar producto al carrito:", error);
    res.status(500).json({ error: "Error al agregar producto al carrito", details: error.message });
  }
});


export default router;
