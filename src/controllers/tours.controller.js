const TourModel = require("../models/tour.model");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const getAllTours = asyncHandler(async (req, res, next) => {
  // Note: when using the 'asyncHandler' function, we must always pass the next() function so that the error can be further passed on to the error handler.

  // API features: Filtering

  console.log("req.query", req?.query);
  // const modifiedQuery = {
  //   ...req.query,
  //   sort: "-ratingsAverage price",
  //   limit: "5",
  // };

  // 2 different ways of implementing filtering:
  // 1. use filter object
  // const tours = await TourModel.find({
  //   duration: 5,
  //   difficulty: "easy",
  // });

  //  2. use special mongoose methods (where, equals, lt, lte, sort, etc.)
  // const tours = await TourModel.find()
  //   .where("duration")
  //   .equals(5)
  //   .where("difficulty")
  //   .equals("easy");
  // const tours = await TourModel.find();

  // we'll use M1
  // const tours = await TourModel.find(req?.query);
  //  but the problem with this implementation is that it is very simple and cant be extended for sorting, pagination, etc.

  // FILTERING
  // const queryObject = {
  //   ...req.query,
  //  ,
  // }; // { duration: 5, difficulty: 'easy' }
  // console.log("queryObject", queryObject);
  // const excludeFields = ["page", "sort", "limit", "fields"];
  // excludeFields.forEach((field) => delete queryObject[field]); // removing excluded fields from queryObject
  // let queryString = JSON.stringify(queryObject);
  // queryString = queryString.replace(
  //   /\b(gt|gte|lt|lte|in)\b/g,
  //   (match) => `$${match}`
  // );

  // // const tours = await TourModel.find(JSON.parse(queryString)); // await executes the query and returns the results immediately, hence we can't use advanced features like sorting, pagination, etc. so we've to prepare query first and then later execute using exec() function. Note that we can use exec() with the await keyword also but since we use await the query will be executed immediately and we can't use advanced features like sorting, pagination, etc.

  // // BUILDING QUERY
  // const query = TourModel.find(JSON.parse(queryString));

  // SORTING
  // console.log("req?.query?.sort", req?.query?.sort);
  // if (modifiedQuery?.sort) {
  //   const sortBy = modifiedQuery?.sort?.split(",").join(" ");
  //   // console.log("sortBy", sortBy);
  //   query.sort(sortBy);
  // } else {
  //   query.sort("-createdAt");
  // }

  // SELECTING FIELDS
  // if (modifiedQuery?.fields) {
  //   const fields = modifiedQuery?.fields?.split(",").join(" ");
  //   query.select(fields);
  // } else {
  //   query.select("-__v");
  // }

  // PAGINATION
  // const page = modifiedQuery?.page * 1 || 1;
  // const limit = modifiedQuery?.limit * 1 || 10;
  // const skip = (page - 1) * limit;
  // query.skip(skip).limit(limit);

  // if (modifiedQuery?.page) {
  //   const numTours = await TourModel.countDocuments();
  //   if (skip >= numTours) {
  //     // throw new Error("This page does not exist");
  //     return res.status(500).json({
  //       status: "success",
  //       message: "This page does not exist.",
  //     });
  //   }
  // }

  // EXECUTING QUERY
  const features = new APIFeatures(TourModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.mongooseQuery.exec();

  // if (!tours) {
  //   return res.status(500).json({
  //     status: "success",
  //     message: "Error fetching all tour",
  //   });
  // } // we need to rethink this case: finding 0/no/null tours does not mean an error in a get request because this is perfectly valid that there can be no tour at some point in database, so it can't be considered as an error.
  res.status(200).json({
    status: "success",
    results: tours?.length,
    data: {
      tours,
    },
  });
});

const getTourById = asyncHandler(async (req, res, next) => {
  const id = req.params?.id;
  const tour = await TourModel.findById(id); // this is same as TourModel.findOne({ _id: id })
  // console.log("Tour", tour);
  if (!tour) {
    // M1: Basic way
    // return res.status(404).json({
    //   status: "success",
    //   message: "No tour found with id: " + id,
    // });
    // M2 (a): modular and cleaner way
    // throw new AppError(`No tour found with id: ${id}`, 404);
    // alternative to throwing error here, which will be caught by the catch block in the asyncHandler and passed to the next(err) which will then be handled by the global error handler, we could also do below which will directly pass the error to the global error handler and return from this controller.
    // Note: Why return from here, otherwise the function will move on to the next line and try to send 2 responses.
    // M2 (b):
    return next(new AppError(`No tour found with id: ${id}`, 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const updateTourById = asyncHandler(async (req, res, next) => {
  const id = req.params?.id;
  const tour = await TourModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }); // new --> returns the updated document
  if (!tour) {
    // return res.status(404).json({
    //   status: "success",
    //   message: "No tour found with id: " + id,
    // });
    return next(new AppError(`No tour found with id: ${id}`, 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const deleteTourById = asyncHandler(async (req, res, next) => {
  const id = req.params?.id;
  const tour = await TourModel.findByIdAndDelete(id);
  if (!tour) {
    // return res.status(404).json({
    //   status: "success",
    //   message: "No tour found with id: " + id,
    // });
    throw new AppError(`No tour found with id: ${id}`, 500);
  }
  res.status(204).json({
    status: "success",
    // data: {
    //   tour,
    // }, // generally 204 status code or delete operation doesn't return any data
  });
});

const addTour = asyncHandler(async (req, res, next) => {
  const tourData = req.body;
  const tourExist = await TourModel.findOne({ name: tourData?.name });
  if (tourExist) {
    // return res.status(400).json({
    //   status: "success",
    //   message: "A tour with this name already exist.",
    // });
    // Before implementing app error handler and global error handler we handled errors as above.
    throw new AppError("A tour with this name already exist.", 400);
  }
  const tour = await TourModel.create(tourData);
  if (!tour) {
    // return res.status(500).json({
    //   status: "success",
    //   message: "Error adding tour",
    // });
    // Before implementing app error handler and global error handler we handled errors as above.
    throw new AppError("Error adding tour", 500);
  }
  const addedTour = await TourModel.findById(tour?._id);
  if (!addedTour) {
    // return res.status(500).json({
    //   status: "success",
    //   message: "Error fetching added tour",
    // });
    // Before implementing app error handler and global error handler we handled errors as above.
    throw new AppError("Error fetching added tour", 500);
  }

  res.status(201).json({
    status: "success",
    message: "Tour added successfully",
    data: addedTour,
  });
});

const getTourStats = asyncHandler(async (req, res, next) => {
  const stats = await TourModel.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.7 } },
    },
    {
      $group: {
        // _id: null, // this will create one big group with all tours
        // _id: "$difficulty",
        _id: { $toUpper: "$difficulty" },
        // _id: "$ratingsAverage",
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        numRatings: { $sum: "$ratingsQuantity" },
        numTours: { $sum: 1 },
      },
    },
    {
      $sort: { avgPrice: 1 },
    }, // sort the results obtained in previous stage
    {
      $match: { _id: { $ne: "EASY" } }, // to show that we can repeat stages
    },
  ]);
  if (!stats) {
    return res.status(500).json({
      status: "success",
      message: "Error calculating tour stats",
    });
  }
  res.status(201).json({
    status: "success",
    message: "Tour stats calculated successfully",
    data: stats,
  });
});

module.exports = {
  getAllTours,
  getTourById,
  updateTourById,
  deleteTourById,
  addTour,
  getTourStats,
};
