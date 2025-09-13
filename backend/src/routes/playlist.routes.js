import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const playlistRoutes = express.Router();

playlistRoutes.get("/", authMiddleware , getAllListDetails)

playlistRoutes.get("/:playlistId" , authMiddleware , getPlaylistDetails);

playlistRoutes.post("/create-playlist" , authMiddleware , createPlaylist);

playlistRoutes.post("/:playlistId/add-problem" , authMiddleware , addProblemToPlaylist);

playlistRoutes.delete("/delete-playlist/:playlistId" , authMiddleware , deletePlaylist);

playlistRoutes.delete("/:playlistId/remove-problem" , authMiddleware , removeProblemFromPlaylist);

playlistRoutes.put("/update-playlist/:playlistId" , authMiddleware , updatePlaylist);


export default playlistRoutes;
