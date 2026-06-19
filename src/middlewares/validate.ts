import {ZodType, flattenError} from "zod";
import {Request, Response, NextFunction} from "express";
import { sendResponse } from "../helpers/api-response";

export const validate = (schema: ZodType)=>(
    req: Request, res: Response, next: NextFunction
)=>{
    const result = schema.safeParse(req.body);
    if(!result.success){
        return sendResponse(
            res,
            "Validation failed",
            flattenError(result.error).fieldErrors,
            422
        );
    }
    req.body = result.data;
    next();
}