const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  duration: { type: Number, required: [true, "A tour must have a duration"] },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a group size"],
    enum: ["easy", "normal", "medium", "difficult"],
  },
  ratingsAverage: { type: Number, default: 4.5 },
  ratingsQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, "A tour must have a price"] },
  priceDiscount: { type: Number },
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must have a summary"],
  },
  description: { type: String, trim: true },
  imageCover: {
    type: String,
    required: [true, "A tour must have an imageCover"],
  },
  images: [String],
  createdAt: { type: Date, default: Date.now(), select: false },
  slug: String,
  startDates: [Date],
  startLocation: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: { type: String, default: "Point" },
      coordinates: [Number],
      address: String,
      day: Number,
    },
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

tourSchema.index({ price: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.pre(/^find/, function (next) {
  this.populate("guides");
  next();
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
