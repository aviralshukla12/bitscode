import express from "express";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";
import { createProblem  , getAllProblems , getProblemById , updateProblemById , deleteProblemById , getSolvedProblemsByUser} from "../controllers/problem.controller.js";
const problemroutes = express.Router();


problemroutes.post("/create-problem" , authMiddleware , checkAdmin, createProblem);

problemroutes.get("/get-all-problems" , authMiddleware ,getAllProblems);

problemroutes.get("/get-problem/:id" , authMiddleware , getProblemById);
 
problemroutes.put("/update-problem/:id" , authMiddleware , checkAdmin , updateProblemById);

problemroutes.delete("/delete-problem/:id" , authMiddleware , checkAdmin , deleteProblemById);

problemroutes.get("/get-solved-problems" , authMiddleware , getSolvedProblemsByUser);

export default problemroutes;