import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import { uploadMediaFiles } from "../servers/media.service";

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    // Uploaded files from multer
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return sendResponse(res, "No files uploaded", [], 400);
    }

    const { alt } = req.body;
    // form-data sends strings, so default to true unless "false" is passed
    const storeThumbnail = req.body.store_thumbnail !== "false";

    const media = await uploadMediaFiles(files, alt ?? null, storeThumbnail);

    return sendResponse(res, "Media uploaded successfully", media, 201);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to upload media", {}, 500);
  }
};
