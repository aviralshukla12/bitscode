import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const submissionRoutes =  express.Router();

submissionRoutes.get("/get-all submissions" ,authMiddleware, getAllSubmissions);
submissionRoutes.get("/get-submission/:id" , authMiddleware, getAllSubmissionsForProblem);
submissionRoutes.get("/get-submissions-count/:problemId" , authMiddleware, getAllSubmissionsForProblem);

export default submissionRoutes;