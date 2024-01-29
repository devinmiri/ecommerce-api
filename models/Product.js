const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide a product name"],
      maxLength: [100, "Name can not exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxLength: [1000, "Description can not exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      default: 0,
    },

    image: {
      type: String,
      default: "/uploads/example.jpg",
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: ["office", "home", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide a company"],
      enum: {
        values: ["marcos", "ikea", "liddy"],
        message: "{VALUE} is not supported",
      },
    },

    colors: {
      type: [String],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },

    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    avarageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
  justOne: false,
});

ProductSchema.pre("deleteOne", { document: true }, async function () {
  console.log(this._id);
  await this.model("Review").deleteMany({ product: this._id });
});




module.exports = mongoose.model("Product", ProductSchema);
