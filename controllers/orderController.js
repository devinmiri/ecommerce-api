const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const customError = require("../errors");
const Order = require("../models/Order");
const checkPermission = require("../utils/checkPermission");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "some secret key";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (cartItems.length < 1 || !cartItems) {
    throw new customError.BadRequestError("No cart items provided");
  }
  if (!tax || !shippingFee) {
    throw new customError.BadRequestError("Please provide shippingFee and tax");
  }
  let orderItems = [];
  let subtotal = 0;
  for (let item of cartItems) {
    const productDb = await Product.findOne({ _id: item.product });
    if (!productDb) {
      throw new customError.NotFoundError(
        `Product not found with id ${item.product}`
      );
    }

    const { name, price, image, _id } = productDb;
    let singleOrderItem = {
      name,
      image,
      price,
      amount: item.amount,
      product: _id,
    };

    subtotal += item.amount * price;
    orderItems.push(singleOrderItem);
    // orderItems = [...orderItems, singleOrderItem];
  }

  // calculate total amount
  const total = subtotal + tax + shippingFee;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    tax,
    subtotal,
    shippingFee,
    total,
    cartItems: orderItems,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new customError.NotFoundError(`Order not found with id ${id}`);
  }
  checkPermission(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const {paymentIntentId} = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new customError.NotFoundError(`Order not found with id ${id}`);
  }
  checkPermission(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = 'Paid';
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });

  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  getCurrentUserOrders,
};
