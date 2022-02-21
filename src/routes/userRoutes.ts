import express from "express";
const router = express.Router();
import { signUp, signIn } from "../controllers/userController";

router.post("/signUp", signUp);
router.post("/signIn", signIn);

export default router;