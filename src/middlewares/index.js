module.exports = {
  tourValidation: require("./tourValidation.middleware"),
  paramValidation: require("./paramValidation.middleware"),
  updateTourValidation: require("./updateTourValidation.middleware"),
  aliasTopTours: require("./aliasTopTours.middleware"),
  validateUserSignup: require("./validateUserSignup.middleware"),
  validateUserLogin: require("./validateUserLogin.middleware"),
  protectRoute: require("./protectRoute.middleware"),
  updateUserValidation: require("./updateUserValidation.middleware"),
  restrictAccess: require("./restrictAccess.middleware"),
};
