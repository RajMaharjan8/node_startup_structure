import prisma from "../db/config";

// Build the gateway redirect payload. Real signing keys go here later.
export const initiateOnlinePayment = async (orderId: number) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.payment_method === "COD") throw new Error("Order is COD");

  // TODO: build eSewa / Khalti signed request with merchant keys + return url
  return {
    order_id: order.id,
    method: order.payment_method,
    amount: order.total,
    // payment_url: "...",  // filled once gateway keys are configured
  };
};

// Called from gateway callback once we have a reference + verified status.
export const verifyOnlinePayment = async (
  orderId: number,
  reference: string,
  success: boolean,
  payload: any,
) => {
  const txn = await prisma.transaction.findFirst({
    where: { order_id: orderId },
    orderBy: { created_at: "desc" },
  });
  if (!txn) throw new Error("Transaction not found");

  // TODO: verify `reference` against gateway lookup API before trusting it

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: txn.id },
      data: { status: success ? "SUCCESS" : "FAILED", reference, payload },
    }),
    ...(success
      ? [
          prisma.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          }),
        ]
      : []),
  ]);

  return { success };
};

// COD collected at delivery
export const confirmCod = (orderId: number) =>
  prisma.transaction
    .findFirst({ where: { order_id: orderId }, orderBy: { created_at: "desc" } })
    .then((txn) => {
      if (!txn) throw new Error("Transaction not found");
      return prisma.$transaction([
        prisma.transaction.update({
          where: { id: txn.id },
          data: { status: "SUCCESS" },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        }),
      ]);
    });

export const getTransactions = async (
  perPage: number,
  skip: number,
  status: string | null,
) => {
  const where = status ? { status: status as any } : {};
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: { order: { select: { id: true, user_id: true, total: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);
  return { transactions, total };
};
