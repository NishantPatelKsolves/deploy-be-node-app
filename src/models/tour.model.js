const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, "Each tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Each tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "Each tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: { type: Number, default: 4.5 },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, "Each tour must have a price"] },
    summary: {
      type: String,
      trim: true,
      required: [true, "Each tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Each tour must have a description"],
    },
    imageCover: {
      type: String,
      required: [true, "Each tour must have a cover image"],
    },
    images: [String],
    startDates: [Date],
    // rating: { type: Number, default: 4.5 },
    //   guides: [
    //     {
    //       type: mongoose.Schema.ObjectId,
    //       ref: "User",
    //     },
    //   ],
    //   price: { type: Number, required: [true, "Each tour must have a price"] },
    //   priceDiscount: Number,
    //   createdAt: {
    //     type: Date,
    //     default: Date.now(),
    //     select: false,
    //   },
  },
  { timestamps: true }
);

const TourModel = mongoose.model("Tour", tourSchema);

module.exports = TourModel;
