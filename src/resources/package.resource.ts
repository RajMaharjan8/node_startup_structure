import { ItemResponse } from "./item.resource";

export const PackageResponse = (pkg: any) => {
  return {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    discount_price: pkg.discount_price,
    final_price: pkg.discount_price ?? pkg.price,
    is_active: pkg.is_active,
    thumbnail_id: pkg.thumbnail_id,
    items: pkg.items?.map((pi: any) => ({
      quantity: pi.quantity,
      item: pi.item ? ItemResponse(pi.item) : undefined,
    })),
    created_at: pkg.created_at,
  };
};
