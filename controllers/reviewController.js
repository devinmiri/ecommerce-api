const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { checkPermission } = require("../utils");

const createReview = async (req, res) => {
  const { userId } = req.user;
  const { product: productId } = req.body;
  req.body.user = userId;

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new customError.BadRequestError("No such product");
  }

  const alreadySubmittedReview = await Review.findOne({
    product: productId,
    user: userId,
  });

  if (alreadySubmittedReview) {
    throw new customError.BadRequestError(
      "You have already submitted a review"
    );
  }

  const review = await Review.create(req.body);
  res.status(StatusCodes.OK).json({ review });
};
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: " name category company",
  });

  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const getSingleReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new customError.NotFoundError("Review not found");
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const { title, comment, rating } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new customError.NotFoundError("Review not found");
  }
  checkPermission(req.user, review.user);

  review.title = title;
  review.comment = comment;
  review.rating = rating;

  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const reviewId = req.params.id;

  const review = await Review.findOneAndDelete({ _id: reviewId });
  if (!review) {
    throw new customError.NotFoundError("Review not found");
  }
  checkPermission(req.user, review.user);
  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Review deleted successfully" });
};

const getSingleProductReviews = async (req, res) => {
  const productId = req.params.id;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
