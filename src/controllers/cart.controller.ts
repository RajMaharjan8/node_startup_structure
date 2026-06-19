import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import { authId } from "../helpers";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../servers/cart.service";

export const showCart = async (req: Request, res: Response) => {
  try {
    const cart = await getCart(authId(req));
    return sendResponse(res, "Cart Fetched Successfully", cart);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

export const addCart = async (req: Request, res: Response) => {
  try {
    const { item_id, package_id, quantity } = req.body;
    const cartItem = await addToCart(
      authId(req),
      item_id ?? null,
      package_id ?? null,
      quantity ?? 1,
    );
    return sendResponse(res, "Added to Cart", cartItem, 201);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to add to cart", {}, 500);
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    await updateCartItem(authId(req), Number(req.params.id), req.body.quantity);
    return sendResponse(res, "Cart Updated", []);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to update cart", {}, 500);
  }
};

export const removeCart = async (req: Request, res: Response) => {
  try {
    await removeCartItem(authId(req), Number(req.params.id));
    return sendResponse(res, "Item Removed", []);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to remove item", {}, 500);
  }
};

export const emptyCart = async (req: Request, res: Response) => {
  try {
    await clearCart(authId(req));
    return sendResponse(res, "Cart Cleared", []);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to clear cart", {}, 500);
  }
};
