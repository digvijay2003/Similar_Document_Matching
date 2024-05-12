const User = require('./models/user');

const isLoggedIn = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }
  const user = await User.findById(req.session.userId).select('-password'); // Exclude password from user object
  req.user = user; // Attach user object to the request for access in routes
  next();
};

module.exports = isLoggedIn;