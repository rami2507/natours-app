const asyncHandler = require("express-async-handler");
const AppError = require("./../utils/AppError");
const User = require("./../models/userModel");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory.js");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     // user-id-currenttimestamp.jpeg
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image! please upload only images", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.resizeUserphoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.uploadUserPhoto = upload.single("photo");

const filterObj = (obj, ...properties) => {
  let newObj = {};
  for (i = 0; i < properties.length; i++) {
    for (let key in obj) {
      if (key === properties[i]) {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.updateMe = asyncHandler(async (req, res, next) => {
  // CREATE ERROR IF USER POSTS PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  const filteredObj = filterObj(req.body, "name", "email");
  if (!(filteredObj.name && filteredObj.email)) {
    return next(new AppError("please specify the name or email"));
  }

  if (req.file) filteredObj.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj);
  res.status(200).json({
    status: "success",
    message: "data modified successfuly",
    updatedUser,
  });
});

exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(204).json({
    status: "success",
    message: "User has been deleted successfuly",
  });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
