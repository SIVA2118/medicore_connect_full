import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../Models/Admin.js";
import Receptionist from "../Models/Receptionist.js";
import Doctor from "../Models/Doctor.js";
import Scanner from "../Models/Scanner.js";
import Biller from "../Models/Biller.js";
import Lab from "../Models/Lab.js";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user =
      (await Admin.findById(decoded.id)) ||
      (await Doctor.findById(decoded.id)) ||
      (await Receptionist.findById(decoded.id)) ||
      (await Scanner.findById(decoded.id)) ||
      (await Biller.findById(decoded.id)) ||
      (await Lab.findById(decoded.id));

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ NORMALIZE USER OBJECT
    req.user = {
      id: user._id,       // 🔥 IMPORTANT FIX
      role: user.role,
      data: user,         // optional (full document if needed)
    };

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
