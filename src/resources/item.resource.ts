import { Item } from "../../generated/prisma/client";

export const ItemResponse = (item: Item) => {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    discount_price: item.discount_price,
    final_price: item.discount_price ?? item.price,
    description: item.description,
    stock_qty: item.stock_qty,
    in_stock: item.stock_qty > 0,
    is_active: item.is_active,
    thumbnail_id: item.thumbnail_id,
    created_at: item.created_at,
  };
};
