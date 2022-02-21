import express, { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { createAccessToken } from "../config/helper";
import { validateSignUp, validateSignIn } from "../middlewares/validation";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = validateSignUp(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    try {
        const { username, email, password, role } = value;
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: "User already exists" });
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userCreate = await User.create({ username, email, password: hashedPassword, role });
        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            userId: userCreate._id
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = validateSignIn(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    try {
        const { username, email, password } = value;
        if (!username && !email) return res.status(400).json({ error: "Provide username or email" });
        let user: Record<string, any> | null = username? await User.findOne({ username }) : await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User does not exist" });
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ error: "Invalid password" });
        let signature = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
        const token = createAccessToken(signature);
        user.password = undefined;
        return res.status(200).json({
            status: "success",
            message: `User signed in successfully. Welcome ${user.username}`,
            userId: user._id,
            token
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};