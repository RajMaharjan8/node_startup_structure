import { Response } from "express";

export const sendResponse=(
    res: Response,
    message: any,
    data: unknown = null,
    statusCode: number = 200
)=>{
    return res.status(statusCode).json({
        status: statusCode,
        message: message,
        data: data ?? []
    });
}