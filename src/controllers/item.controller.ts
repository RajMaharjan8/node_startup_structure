import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import { ItemResponse } from "../resources/item.resource";
import {
  getItems,
  findItem,
  createItem,
  updateItem,
  deleteItem,
} from "../servers/item.service";
import { adjustStock } from "../servers/inventory.service";

const listItems = (activeOnly: boolean) => async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.per_page ?? 10);
    const skip = (page - 1) * perPage;
    const keyword = String(req.query.keyword ?? "");
    const sortBy = req.query.sort_by === "asc" ? "asc" : "desc";

    const { items, total } = await getItems(
      perPage,
      skip,
      keyword || null,
      sortBy,
      activeOnly,
    );

    return sendResponse(res, "Items Fetched Successfully", {
      data: items.map(ItemResponse),
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

export const getItemsPublic = listItems(true);
export const getItemsAdmin = listItems(false);

export const showItem = async (req: Request, res: Response) => {
  try {
    const item = await findItem(Number(req.params.id));
    if (!item) return sendResponse(res, "Item Not Found", [], 404);
    return sendResponse(res, "Item Fetched Successfully", ItemResponse(item));
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

export const storeItem = async (req: Request, res: Response) => {
  try {
    const { stock_qty, ...rest } = req.body;
    const item = await createItem({ ...rest, stock_qty: stock_qty ?? 0 });

    if (stock_qty && stock_qty > 0) {
      await adjustStock(item.id, stock_qty, "RESTOCK", "Initial stock");
    }

    return sendResponse(res, "Item Created Successfully", ItemResponse(item), 201);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to create item", {}, 500);
  }
};

export const editItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await findItem(id);
    if (!existing) return sendResponse(res, "Item Not Found", [], 404);

    // stock changes go through inventory, not a raw set
    const { stock_qty, ...data } = req.body;
    const item = await updateItem(id, data);
    return sendResponse(res, "Item Updated Successfully", ItemResponse(item));
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to update item", {}, 500);
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    await deleteItem(Number(req.params.id));
    return sendResponse(res, "Item Deleted Successfully", []);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to delete item", {}, 500);
  }
};
