const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      try {
        console.log('start')
        token = req.headers.authorization.split(" ")[1];
        console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log(decoded)
        req.user = await User.findById(decoded.id).select("-password");
        console.log(req.user)
        next();
      } catch (error) {
        res.status(402).json({
          success: false,
          error: error,
        });
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error,
    });
  }
};

module.exports = { protect };
