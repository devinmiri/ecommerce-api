const { StatusCodes } = require("http-status-codes");
const path = require("path");
const customError = require("../errors");
const Product = require("../models/Product");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.OK).json(product);
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({}).populate("reviews");
  res.status(StatusCodes.OK).json({  count: products.length,products });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new customError.NotFoundError("Product not found");
  }
  req.product = product;
  res.status(StatusCodes.OK).json(product);
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  // const { name, description, category, company } = req.body;

  // if (!name || !description || !category || !company) {
  //   throw new customError.BadRequestError("Please provide a required fields");
  // }
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedProduct) {
    throw new customError.NotFoundError("Product not found");
  }
  res.status(StatusCodes.OK).json(updatedProduct);
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndDelete({ _id: productId });
  if (!product) {
    throw new customError.NotFoundError("Product not found");
  }
  await product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Product deleted successfully" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new customError.BadRequestError("No files to upload");
  }

  const {
    image,
    image: { name, size, mimetype },
  } = req.files;

  if (!mimetype.startsWith("image")) {
    throw new customError.BadRequestError("Only images are allowed");
  }
  if (size > 1024 * 1024) {
    throw new customError.BadRequestError("Image size must be less than 1MB");
  }
  const imagePath = path.resolve(__dirname, "../public/uploads/" + name);
  console.log(imagePath);

  await image.mv(imagePath);

  req.image = `./uploads/${name}`;

  res.status(StatusCodes.OK).json({ image: `./uploads/${name}` });
};

module.exports = {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
