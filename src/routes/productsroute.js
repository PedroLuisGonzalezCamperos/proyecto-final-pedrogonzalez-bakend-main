import express from "express";
import Product from "../productModel.js"; // Asegúrate de agregar la extensión ".js"

const router = express.Router();

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    console.log("📩 Productos obtenidos:", products); // 👈 Agrega esto para ver la respuesta

    if (!Array.isArray(products)) {
      return res.status(500).json({ error: "La respuesta no es un array válido" });
    }

    res.json(products);
  } catch (error) {
    console.error("❌ Error en GET /products:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// POST - Agregar un nuevo producto
// POST - Agregar un nuevo producto
router.post("/producto", async (req, res) => {
  try {
    console.log("📩 Body recibido:", req.body); // 👈 Para ver qué está llegando en la petición

    const { title, description, code, price, stock } = req.body;
    
    if (!title || !description || !code || !price || !stock) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const newProduct = new Product({ title, description, code, price, stock });
    await newProduct.save();
    res.status(201).json({ message: "Producto agregado", product: newProduct });

  } catch (error) {
    console.error("❌ Error al agregar producto:", error); // 👈 Muestra el error exacto en la terminal
    res.status(500).json({ error: "Error al agregar producto", details: error.message });
  }
});


// GET - Obtener un producto por su _id
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // Obtener el id de los parámetros
    const product = await Product.findById(pid); // Buscar el producto por _id

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product); // Enviar el producto encontrado
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// PUT - Actualizar un producto por su _id
router.put("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // Obtener el id de los parámetros
    const updates = req.body; // Obtener los datos a actualizar desde el body

    // Buscar y actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(pid, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// DELETE - Eliminar un producto por su _id
router.delete("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // Obtener el id de los parámetros

    // Buscar y eliminar el producto
    const deletedProduct = await Product.findByIdAndDelete(pid);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});



export default router;
