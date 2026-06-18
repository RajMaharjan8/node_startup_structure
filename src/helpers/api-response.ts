import { Response } from "express";

export const sendResponse=(
    res: Response,
    message: string,
    data: unknown = null,
    statusCode: number = 200
)=>{
    return res.status(statusCode).json({
        status: statusCode,
        message: message,
        data: data ?? []
    });
}

export const sendResponseFail =(
    res: Response,
    message: string = "Something Went Wrong",
    error: object,
    statusCode: number = 500
)=>{
    return res.status(statusCode).json({
        status: statusCode,
        message: message,
        error: error
    })
}