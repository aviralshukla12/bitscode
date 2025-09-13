import express from "express";
import { register, login, logout, profile } from "../controllers/user.controller.js"; // ✅ use correct name
import { authMiddleware} from "../middleware/auth.middleware.js";


const authRoutes = express.Router();

authRoutes.post("/register", register);      
authRoutes.post("/login", login);
authRoutes.post("/logout", authMiddleware, logout);
authRoutes.get("/profile", authMiddleware, profile);

export default authRoutes;
