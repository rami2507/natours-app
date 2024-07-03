const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// USER SCHEMA
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please tell us your name"] },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid Email",
    },
  },
  photo: { type: String, default: "default.jpg" },
  password: {
    type: String,
    required: [true, "Please provide a Password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // THIS WORKS WITH CREATE AND SAVE ONLY BUT NOT WITH UPDATE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
  },
});

// HASHING PASSWORD
userSchema.pre("save", async function (next) {
  // RUN THIS WHEN THE PASSWORD IS MODIFIED
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// UPDATING THE passwordChangedAt PROPERTY
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT chnaged
  return false;
};

// USER MODEL
const User = mongoose.model("User", userSchema);

// EXPORTING THE USER MODEL
module.exports = User;
