const AppError = require("./../utils/AppError");
const asyncHandler = require("express-async-handler");

exports.deleteOne = (model) => {
  return asyncHandler(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No tour found with that ID!", 404));
    }
    res.status(204).json({
      status: "success",
      tour: null,
    });
  });
};

exports.updateOne = (model) => {
  return asyncHandler(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No doc found with that ID!", 404));
    }
    res.status(200).json({ status: "success", data: { doc } });
  });
};

exports.createOne = (model) => {
  return asyncHandler(async (req, res, next) => {
    const doc = await model.create(req.body, { runValidators: true });
    res.status(201).json({
      status: "success",
      data: { doc },
    });
  });
};

exports.getOne = (model) => {
  return asyncHandler(async (req, res, next) => {
    const doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError("No tour found with that ID!", 404));
    }
    res.status(200).json({
      status: "success",
      data: { doc },
    });
  });
};

exports.getAll = (model) => {
  return asyncHandler(async (req, res, next) => {
    const queryObj = { ...req.query };
    const excludedFields = ["sort", "page", "fields", "limit"];

    // Remove excluded fields from queryObj
    excludedFields.forEach((el) => delete queryObj[el]);

    // Construct the query
    let query = { ...queryObj };
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/(lt|lte|gt|gte)/g, (match) => `$${match}`);

    query = model.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const queryBy = req.query.sort.split(",").join("");
      query = query.sort(queryBy);
    }

    // PAGINATION
    if (req.query.page) {
      const limit = req.query.limit * 1 || 1;
      const page = req.query.page * 1 || 1;
      const skip = (page - 1) * limit;
      const numDocs = await Tour.countDocuments();
      if (skip >= numDocs) {
        throw new Error("Error");
      }
      query = query.skip(skip).limit(limit);
    }

    // Executing the query
    const docs = await query;

    res
      .status(200)
      .json({ status: "success", results: docs.length, data: { data: docs } });
  });
};
