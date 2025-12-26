import bcrypt from "bcrypt";
import { db } from "../libs/db.js";
import jwt from "jsonwebtoken";

// REGISTER
const register = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Enter all fields"
        });
    }

    try {
        const existingUser = await db.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email,
                password: hashPassword,
                name: name || "",
                role: "USER"
            }
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "development",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        });
    } catch (error) {
        console.error("Error while registering user:", error.message || error);
        res.status(500).json({
            success: false,
            message: "Error while registering user",
            error: error.message
        });
    }
};

// LOGIN
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found, please register"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "development",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            }
        });
    } catch (error) {
        console.log("Error while logging in user", error);
        res.status(500).json({
            success: false,
            message: "Error while logging in user"
        });
    }
};

// LOGOUT
const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "development"
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        console.log("Error while logging out user", error);
        res.status(500).json({
            success: false,
            message: "Error while logging out user"
        });
    }
};

// GET CURRENT USER
const me = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: req.user // assuming set in middleware
        });
    } catch (error) {
        console.log("Error while getting user", error);
        res.status(500).json({
            success: false,
            message: "Error while getting user"
        });
    }
};

export { register, login, logout, me };
