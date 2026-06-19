import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import { authId } from "../helpers";
import { findOrder } from "../servers/order.service";
import {
  initiateOnlinePayment,
  verifyOnlinePayment,
  confirmCod,
  getTransactions,
} from "../servers/payment.service";

// Customer: start an online payment for own order
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const order = await findOrder(Number(req.params.id), authId(req));
    if (!order) return sendResponse(res, "Order Not Found", [], 404);

    const data = await initiateOnlinePayment(order.id);
    return sendResponse(res, "Payment Initiated", data);
  } catch (err: any) {
    return sendResponse(res, err.message ?? "Failed to initiate payment", [], 400);
  }
};

// Gateway callback (eSewa / Khalti) -> verify and update transaction
export const paymentCallback = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.query.order_id ?? req.body.order_id);
    const reference = String(req.query.reference ?? req.body.reference ?? "");
    // gateways signal success differently; normalize to a boolean
    const success =
      String(req.query.status ?? req.body.status ?? "").toUpperCase() ===
      "SUCCESS";

    const result = await verifyOnlinePayment(orderId, reference, success, {
      ...req.query,
      ...req.body,
    });
    return sendResponse(
      res,
      result.success ? "Payment Successful" : "Payment Failed",
      result,
      result.success ? 200 : 400,
    );
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Payment verification failed", {}, 500);
  }
};

// Admin: mark COD as collected
export const confirmCodPayment = async (req: Request, res: Response) => {
  try {
    await confirmCod(Number(req.params.id));
    return sendResponse(res, "COD Payment Confirmed", []);
  } catch (err: any) {
    return sendResponse(res, err.message ?? "Failed to confirm", [], 400);
  }
};

// Admin: transaction history incl. failed
export const transactionHistory = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.per_page ?? 20);
    const skip = (page - 1) * perPage;
    const status = req.query.status ? String(req.query.status) : null;

    const { transactions, total } = await getTransactions(perPage, skip, status);
    return sendResponse(res, "Transactions Fetched Successfully", {
      data: transactions,
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
