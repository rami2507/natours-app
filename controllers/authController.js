const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const User = require("./../models/userModel");
const Email = require("./../utils/sendEmail");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: 30000000,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 900000000),
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const correctPassword = async (enteredPass, originalPass) => {
  return await bcrypt.compare(enteredPass, originalPass);
};

const createPasswordResetToken = async function (user) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 1000 * 60000 * 100000;
  await user.save({ validateBeforeSave: false });
  return resetToken;
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check If Email And Password Exist
  if (!email || !password)
    return next(new AppError("Please provide your email and password!", 400));
  // 2) Check If User And Password are correct
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await correctPassword(password, user.password))) {
    return next(new AppError("Email or password is incorrect", 401));
  }

  // 3) If Everything Okay Send Token To Client
  createSendToken(user, 200, res);
});

exports.logout = async (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    data: null,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting Token And Check If It's There
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError("Your are not logged in! Please login to get access", 401)
    );
  // 2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check If User Still Exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("the user belonging to this token does no longer exist")
    );
  }
  // If Check If User Changed Password After The Token Was Issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verify Token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Check If User Still Exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // If Check If User Changed Password After The Token Was Issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // GRANT ACCESS TO PROTECTED ROUTE
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    for (let i = 0; i < roles.length; i++) {
      if (req.user.role.includes(roles[i])) {
        return next();
      }
    }
    next(new AppError("You do not have permission to do that"), 401);
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on Posted Email
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new AppError("Your email is not registered"), 404);
  }
  try {
    // Generate the random reset token
    const resetToken = await createPasswordResetToken(user);
    // Send it to email
    const resetUrl = `${req.protocol}:3000//${req.hostname}/api/v2/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "Token has been sent to email!",
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email, please try again later"
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");
  // 2) If token has not expired, and there is user, set the new pass
  if (!user) {
    return next(new AppError("Your token is invalid or expired,"), 400);
  }
  const { password, passwordConfirm } = req.body;
  if (!(password && passwordConfirm)) {
    return next(
      new AppError("Please specify your password and password Confirm", 401)
    );
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for thew user
  // ^ we have done this step using a pre save middleware in the model ^
  // 4) Log the user in , send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // GET USER FROM THE COLLECTION
  const user = await User.findById(req.user.id).select("+password");
  // CHECK IF CURRENT PASSWORD IS CORRECT
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (
    !currentPassword ||
    !(await correctPassword(currentPassword, user.password))
  ) {
    return next(new AppError("Current password is invalid", 401));
  }
  // Set the new pass
  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;
  await user.save();
  // LOG THE USER IN BY SENDING A NEW JWT
  createSendToken(user, 200, res);
});
