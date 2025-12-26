import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


import authroutes from "./routes/auth.routes.js";
import problemroutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("HEllo guys welcome to bitscode 🔥")
})

app.use("/api/v1/auth" , authroutes);
app.use("/api/v1/problems" , problemroutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoutes);

app.use("/api/v1/playlist", playlistRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
