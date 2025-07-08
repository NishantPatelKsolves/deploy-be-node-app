class APIFeatures {
  constructor(mongooseQuery, queryFromExpress) {
    this.mongooseQuery = mongooseQuery;
    this.queryFromExpress = queryFromExpress;
    // this.modifiedQuery = {
    //   ...queryFromExpress,
    //   sort: "-ratingsAverage price",
    //   limit: "5",
    // }; // if you do this, then if no query is passed, then this.modifiedQuery will be will set 'sort' to '-ratingsAverage price' and 'limit' to '5', which is not desired  if we want to fetch all routes, so we can't implement 'alias-route' in this way, we'll have to create a separate route for the alias routes to get top-5-cheap tours.
  }

  filter() {
    const queryObject = { ...this.queryFromExpress };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((field) => delete queryObject[field]);
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryFromExpress?.sort) {
      const sortBy = this.queryFromExpress?.sort?.split(",").join(" ");

      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryFromExpress?.fields) {
      const fields = this.queryFromExpress?.fields?.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryFromExpress?.page || 1;
    const limit = this.queryFromExpress?.limit || 100;
    const skip = (page - 1) * limit;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
