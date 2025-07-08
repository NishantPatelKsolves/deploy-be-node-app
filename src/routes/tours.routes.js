const express = require("express");
const {
  getAllTours,
  getTourById,
  updateTourById,
  deleteTourById,
  addTour,
  getTourStats,
} = require("../controllers/tours.controller");

const {
  paramValidation,
  tourValidation,
  updateTourValidation,
  aliasTopTours,
} = require("../middlewares/index");

const tourRouter = express.Router();

// Param middleware:  param middleware is a special type of middleware that only runs when a specific route parameter is present in the URL. It's used to automatically handle or preprocess route parameters, such as validating, transforming, or fetching data based on the parameter before reaching the route handler.
tourRouter.param("id", async (req, res, next, id) => {
  // test if the tour exist for this 'id' then only move forward
  //   const tour = await Tour.findById(id);
  //   if (!tour) {
  //     return res.status(404).json({ message: "Tour not found" });
  //   }
  //   req.tour = tour;

  // console.log("Id from param middleware", id);
  next();
});
// Alias routing
tourRouter.get(`/`, getAllTours);
tourRouter.get(
  "/top-5-cheap",
  // aliasTopTours,
  getAllTours
); // to get the top 5 cheap tours, we could re-write the entire logic that we had in getAllTours or we could use a middleware before running this controller which will manipulate the query object and forwards it to the controller.
// // Due to the recent updates in Express 5, we can't add any property too query object, so 'aliasTopTours' middleware is useless.

tourRouter.get("/stats", getTourStats);
tourRouter.get(`/:id`, paramValidation, getTourById);
tourRouter.patch(`/:id`, paramValidation, updateTourValidation, updateTourById);
tourRouter.delete(`/:id`, paramValidation, deleteTourById);
tourRouter.post("/", tourValidation, addTour);

module.exports = tourRouter;
