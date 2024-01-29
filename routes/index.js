const express = require("express");
const router = express.Router();

const authRouter = require("./authRouter");
const userRouter = require("./userRouter");
const productRouter = require("./productRouter");
const reviewRouter = require("./reviewRouter");
const orderRouter = require("./orderRouter");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/products", productRouter);
router.use("/reviews", reviewRouter);
router.use("/orders", orderRouter);

module.exports = router;
