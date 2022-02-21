import { Request, Response, NextFunction } from "express";
import client from "../config/redis";
import fixture from "../models/fixture";
import dotenv from "dotenv";
dotenv.config();

export const authorizeUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role }: any = req.user;
        if (role === "admin") {
            next();
        } else {
            return res.status(401).json({ error: "As a user, you are not authorized to view this content" });
        }
    } catch (error) {
        console.log(error);
    }
};

export const verifyUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url } = req.params;
        const rediskey = "fixturelist";
        const redisFixtureUrl = "fixtureUrl";
        const urlExists = await client.hGet(redisFixtureUrl, url);
        if (urlExists) {
            const fixture: any = await client.hGet(rediskey, urlExists);
             req.params = JSON.parse(fixture)._id;
            next();
        } else {
            return res.status(400).json({ error: "Fixture not found" });
        }
    } catch (error) {
        console.log(error);
    }
};