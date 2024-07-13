const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = async (req, res, next) => {
  //Get the JWT token from the request header
  let authHeader = req.headers["authorization"];
  let token;
  if (authHeader != undefined && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7, authHeader.length);
  }

  //  //If there is no token, return an error
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Get the JWT token from the request header
  // const token = req.headers["authorization"];

  // // If there is no token, return an error
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  // Verify the JWT token
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Next middleware
  next();
};

module.exports = jwtAuthMiddleware;
