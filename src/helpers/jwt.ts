import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const createAccessToken = (payload: object)=>{
    return jwt.sign(
        payload,
        ACCESS_SECRET,
        {
            expiresIn:"15m"
        }
    );
}

export const createRefresToken = (payload: object)=>{
    return jwt.sign(
        payload,
        REFRESH_SECRET,
        {
            expiresIn:"7d"
        }
    );
}