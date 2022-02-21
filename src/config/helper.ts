import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const createAccessToken = (signature: Record<string, any>) => {
    try {
        const jwtSecret: any = process.env.JWT_SECRET;
        return jwt.sign(signature, jwtSecret, { expiresIn: "1h" });
    } catch (error) {
        console.error(error);
        return;
    }
};

export const arrayOfObjectsToString = (array: Record<string, any>[]) => {
    let newArr: any[] = [];
    for (let i = 0; i < array.length; i++) {
      let element = array[i];
      newArr = [...newArr, ...Object.keys(element), ...Object.values(element)];
    }
    return newArr.join(", ");
}

export const generateUniqueCode = (size = 22, alpha = true) => {
    let characters: string[] | string = alpha
        ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        : "0123456789";
    characters = characters.split("");
    let selections = "";
    for (let i = 0; i < size; i++) {
        let index = Math.floor(Math.random() * characters.length);
        selections += characters[index];
        characters.splice(index, 1);
        if (i % 4 === 0 && i !== 0 && i !== size - 2) {
            selections += "-";
        }
    }
    return selections;
};