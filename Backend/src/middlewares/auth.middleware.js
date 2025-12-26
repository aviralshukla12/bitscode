import jwt from "jsonwebtoken";
import {db} from "../libs/db.js";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
    try {
        // 1. Check for token
        const token = req.cookies.jwt;
        console.log("JWT from cookies:", token ? "Token exists" : "No token");
        
        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access - No token found"
            });
        }

        // 2. Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded JWT:", decoded);
        } catch(error) {
            console.error("JWT verification error:", error.message);
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access - Invalid token"
            });
        }

        // 3. Find user in database
        let user;
        try {
            user = await db.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    image: true,
                    name: true,
                    email: true,
                    role: true,
                }
            });
            console.log("User found:", user ? user.email : "No user");
        } catch(dbError) {
            console.error("Database error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Database error",
                error: dbError.message
            });
        }

        // 4. Check if user exists
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // 5. Attach user to request
        req.user = user;
        next();
        
    } catch(error) {
        console.error("Unexpected auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: true
            }
        });
        
        if(!user || user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Forbidden Access to perform this action"
            });
        }
        
        next();
    } catch(error) {
        console.error("Error while checking admin:", error);
        res.status(500).json({
            success: false,
            message: "Error while checking admin role",
            error: error.message
        });
    }
};