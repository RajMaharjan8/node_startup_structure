export const OrderResponse = (order: any) => {
  return {
    id: order.id,
    user_id: order.user_id,
    status: order.status,
    payment_method: order.payment_method,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    address: order.address,
    phone: order.phone,
    note: order.note,
    items: order.items?.map((i: any) => ({
      id: i.id,
      item_id: i.item_id,
      package_id: i.package_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    transactions: order.transactions?.map((t: any) => ({
      id: t.id,
      method: t.method,
      status: t.status,
      amount: t.amount,
      reference: t.reference,
      created_at: t.created_at,
    })),
    created_at: order.created_at,
  };
};
