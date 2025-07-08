const getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      users: "Send all users details",
    },
  });
};

module.exports = { getAllUsers };
