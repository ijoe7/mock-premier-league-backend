import { Request, Response, NextFunction } from "express";

export const authorizeUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role }: any = req.user;
        if (role === "admin") {
            next();
        } else {
            return res.status(401).json({ error: "You are not authorized to view this content" });
        }
    } catch (error) {
        console.log(error);
    }
};