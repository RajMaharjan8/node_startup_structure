import {ZodType} from "zod";
import {Request, Response, NextFunction} from "express";
import { sendResponse } from "../helpers/api-response";

export const validate = (schema: ZodType)=>(
    req: Request, res: Response, next: NextFunction
)=>{
    const result = schema.safeParse(req.body);
    if(!result.success){
        return sendResponse(
            res,
            result.error.flatten().fieldErrors,
            [],
            422
        );
    }
    req.body = result.data;
    next();
}