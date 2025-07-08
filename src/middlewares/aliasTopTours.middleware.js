// Due to the recent updates in Express 5, we can't add any property too query object, this middleware is useless.
// https://expressjs.com/en/guide/migrating-5.html#req.query
const aliasTopTours = (req, res, next) => {
  console.log("Inside alias middleware");
  console.log("req.query", req.query);
  const modifiedQuery = {
    ...req.query,
    sort: "-ratingsAverage price",
    limit: "5",
  };

  req.query = modifiedQuery;

  console.log("req.query", req.query);
  console.log("Exiting alias middleware");

  next();
};

module.exports = aliasTopTours;
