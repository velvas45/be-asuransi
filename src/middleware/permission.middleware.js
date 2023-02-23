module.exports = (...roles) => {
  return (req, res, next) => {
    const role = req.user.role;
    if (!roles.includes(role)) {
      return res.status(405).json({
        status: false,
        message: "anda tidak memiliki akses",
      });
    }

    return next();
  };
};
