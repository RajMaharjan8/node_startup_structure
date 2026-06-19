import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import {
  adjustStock,
  getMovements,
  lowStock,
} from "../servers/inventory.service";
import { findItem } from "../servers/item.service";

export const adjustItemStock = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await findItem(id);
    if (!item) return sendResponse(res, "Item Not Found", [], 404);

    const { change, reason, note } = req.body;
    if (item.stock_qty + change < 0) {
      return sendResponse(res, "Stock cannot go negative", [], 400);
    }

    await adjustStock(id, change, reason, note ?? null);
    return sendResponse(res, "Stock Adjusted", []);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to adjust stock", {}, 500);
  }
};

export const stockMovements = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.per_page ?? 20);
    const skip = (page - 1) * perPage;
    const itemId = req.query.item_id ? Number(req.query.item_id) : null;

    const { movements, total } = await getMovements(itemId, perPage, skip);
    return sendResponse(res, "Movements Fetched Successfully", {
      data: movements,
      pagination: {
        total,
        per_page: perPage,
        current_page: page,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

export const lowStockItems = async (req: Request, res: Response) => {
  try {
    const threshold = Number(req.query.threshold ?? 5);
    const items = await lowStock(threshold);
    return sendResponse(res, "Low Stock Items", items);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};
