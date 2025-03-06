import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true }
    }
  ]
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
