const mongoose = require("mongoose");

const SingleOrderItems = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const OrderSchema = new mongoose.Schema({
  tax: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  cartItems: [SingleOrderItems],
  status: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },

  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
  paymentIntentId: {
    type: String,
   
  },
});

module.exports = mongoose.model("Order", OrderSchema);
