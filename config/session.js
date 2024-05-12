const session = require('express-session');

const sessionConfig = {
  secret: 'digvijaysinghpathania25052003', // Replace with a long, random string
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS in production
    maxAge: 60 * 60 * 1000, // Session expires after 1 hour
  },
};

module.exports = session(sessionConfig);