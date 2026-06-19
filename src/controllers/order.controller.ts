import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import { OrderResponse } from "../resources/order.resource";
import { authId } from "../helpers";
import {
  placeOrder,
  getUserOrders,
  findOrder,
  getAllOrders,
  setOrderStatus,
} from "../servers/order.service";

export const checkout = async (req: Request, res: Response) => {
  try {
    const { payment_method, address, phone, note, lines } = req.body;
    const order = await placeOrder(
      authId(req),
      payment_method,
      address,
      phone,
      note ?? null,
      lines,
    );
    return sendResponse(res, "Order Placed Successfully", OrderResponse(order), 201);
  } catch (err: any) {
    // business errors (empty cart, stock, unavailable) -> 400
    return sendResponse(res, err.message ?? "Failed to place order", [], 400);
  }
};

export const myOrders = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.per_page ?? 10);
    const skip = (page - 1) * perPage;

    const { orders, total } = await getUserOrders(authId(req), perPage, skip);
    return sendResponse(res, "Orders Fetched Successfully", {
      data: orders.map(OrderResponse),
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

export const showMyOrder = async (req: Request, res: Response) => {
  try {
    const order = await findOrder(Number(req.params.id), authId(req));
    if (!order) return sendResponse(res, "Order Not Found", [], 404);
    return sendResponse(res, "Order Fetched Successfully", OrderResponse(order));
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

// --- admin ---

export const allOrders = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.per_page ?? 10);
    const skip = (page - 1) * perPage;
    const status = req.query.status ? String(req.query.status) : null;

    const { orders, total } = await getAllOrders(perPage, skip, status);
    return sendResponse(res, "Orders Fetched Successfully", {
      data: orders.map(OrderResponse),
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

export const showOrder = async (req: Request, res: Response) => {
  try {
    const order = await findOrder(Number(req.params.id));
    if (!order) return sendResponse(res, "Order Not Found", [], 404);
    return sendResponse(res, "Order Fetched Successfully", OrderResponse(order));
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

export const changeOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await setOrderStatus(Number(req.params.id), req.body.status);
    return sendResponse(res, "Order Status Updated", OrderResponse(order));
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to update status", {}, 500);
  }
};
