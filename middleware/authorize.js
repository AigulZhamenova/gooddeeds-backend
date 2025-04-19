const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authorize = (roles = []) => {
  return async (req, res, next) => {
    // Получаем токен из заголовков авторизации
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied. You do not have the required role." });
      }

      req.user = user; 
      next();  
    } catch (err) {
      res.status(400).json({ message: "Invalid token." });
    }
  };
};

module.exports = authorize;
