const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide a title"],
      maxLength: [100, "Name can not exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Please provide a review"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calcAvarageRatings = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        avarageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  result &&
    (await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        avarageRating: result[0].avarageRating.toFixed(1) || 0,
        numOfReviews: result[0].numOfReviews || 0,
      }
    ));
  console.log(result);
};

ReviewSchema.post("save", async function () {
  await this.constructor.calcAvarageRatings(this.product);
});
ReviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calcAvarageRatings(this.product);
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
