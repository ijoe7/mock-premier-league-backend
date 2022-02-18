import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
import User from "../models/user";

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;
        const jwtSecret: any = process.env.JWT_SECRET;
        if (authorizationHeader) {
            const token = authorizationHeader.split(" ")[1];
            const decodedToken: any = jwt.verify(token, jwtSecret);
            // Implement redis cache (decodedToken.username)
            const user = await User.findOne({ username: decodedToken.username });
            if (!user) {
                return res.status(401).json({ error: "No user found. You are not authorized to view this content" });
            } else {
                req.user = user;
                next();
            }
        } else {
            return res.status(401).json({ error: `Authentication error. Token missing` });
        }
    } catch (error) {
        console.log(error);
    }
};