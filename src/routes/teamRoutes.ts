import express from "express";
const router = express.Router();
import { addTeam, getAllTeams, getTeam, updateTeam, deleteTeam, searchTeams } from "../controllers/teamController";
import { authenticateUser } from "../middlewares/authentication";
import { authorizeUser } from "../middlewares/authorization";

router.post("/addTeam", authenticateUser, authorizeUser, addTeam);

router.get("/getAllTeams", authenticateUser, authorizeUser, getAllTeams);
router.get("/getTeam/:id", authenticateUser, authorizeUser, getTeam);

router.put("/updateTeam/:id", authenticateUser, authorizeUser, updateTeam);
router.delete("/deleteTeam/:id", authenticateUser, authorizeUser, deleteTeam);

router.get("/searchTeams", searchTeams);

export default router;