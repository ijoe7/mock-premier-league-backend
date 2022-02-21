import express from "express";
const router = express.Router();
import { addFixture, getAllFixtures, getFixture, updateFixture, deleteFixture, getCompleteFixtures, getPendingFixtures, searchFixtures } from "../controllers/fixtureController";
import { authenticateUser } from "../middlewares/authentication";
import { authorizeUser } from "../middlewares/authorization";

router.post("/addFixture", authenticateUser, authorizeUser, addFixture);
router.get("/getAllFixtures", authenticateUser, authorizeUser, getAllFixtures);
router.get("/getFixture/:url", authenticateUser, authorizeUser, getFixture);
router.put("/updateFixture/:url", authenticateUser, authorizeUser, updateFixture);
router.delete("/deleteFixture/:url", authenticateUser, authorizeUser, deleteFixture);

router.get("/getCompleteFixtures", authenticateUser, getCompleteFixtures);
router.get("/getPendingFixtures", authenticateUser, getPendingFixtures);

router.get("/searchFixtures", searchFixtures);

export default router;
