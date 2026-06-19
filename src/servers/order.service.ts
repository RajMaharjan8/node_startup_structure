import prisma from "../db/config";
import { PaymentMethod } from "../../generated/prisma/client";

type Line = { item_id?: number; package_id?: number; quantity: number };

// Build snapshot lines + totals from raw item/package ids
const resolveLines = async (lines: Line[]) => {
  const itemIds = lines.filter((l) => l.item_id).map((l) => l.item_id!);
  const pkgIds = lines.filter((l) => l.package_id).map((l) => l.package_id!);

  const [items, packages] = await Promise.all([
    prisma.item.findMany({ where: { id: { in: itemIds } } }),
    prisma.package.findMany({
      where: { id: { in: pkgIds } },
      include: { items: true },
    }),
  ]);

  const orderItems: {
    item_id: number | null;
    package_id: number | null;
    name: string;
    price: number;
    quantity: number;
  }[] = [];

  // item_id -> total units needed (for stock check / decrement)
  const stockNeed = new Map<number, number>();
  const addNeed = (id: number, qty: number) =>
    stockNeed.set(id, (stockNeed.get(id) ?? 0) + qty);

  let subtotal = 0;

  for (const line of lines) {
    if (line.item_id) {
      const item = items.find((i) => i.id === line.item_id);
      if (!item) throw new Error(`Item ${line.item_id} not found`);
      if (!item.is_active) throw new Error(`Item ${item.name} is unavailable`);
      const price = item.discount_price ?? item.price;
      subtotal += price * line.quantity;
      addNeed(item.id, line.quantity);
      orderItems.push({
        item_id: item.id,
        package_id: null,
        name: item.name,
        price,
        quantity: line.quantity,
      });
    } else if (line.package_id) {
      const pkg = packages.find((p) => p.id === line.package_id);
      if (!pkg) throw new Error(`Package ${line.package_id} not found`);
      if (!pkg.is_active) throw new Error(`Package ${pkg.name} is unavailable`);
      const price = pkg.discount_price ?? pkg.price;
      subtotal += price * line.quantity;
      // a package consumes each of its items' stock
      for (const pi of pkg.items) {
        addNeed(pi.item_id, pi.quantity * line.quantity);
      }
      orderItems.push({
        item_id: null,
        package_id: pkg.id,
        name: pkg.name,
        price,
        quantity: line.quantity,
      });
    }
  }

  return { orderItems, subtotal, stockNeed };
};

const linesFromCart = async (userId: number): Promise<Line[]> => {
  const cart = await prisma.cart.findUnique({
    where: { user_id: userId },
    include: { items: true },
  });
  if (!cart || cart.items.length === 0) throw new Error("Cart is empty");
  return cart.items.map((c) => ({
    item_id: c.item_id ?? undefined,
    package_id: c.package_id ?? undefined,
    quantity: c.quantity,
  }));
};

export const placeOrder = async (
  userId: number,
  paymentMethod: PaymentMethod,
  address: string,
  phone: string,
  note: string | null,
  customLines?: Line[],
) => {
  const lines =
    customLines && customLines.length
      ? customLines
      : await linesFromCart(userId);

  const { orderItems, subtotal, stockNeed } = await resolveLines(lines);

  // stock check
  const ids = [...stockNeed.keys()];
  const stockItems = await prisma.item.findMany({ where: { id: { in: ids } } });
  for (const [id, need] of stockNeed) {
    const it = stockItems.find((s) => s.id === id);
    if (!it || it.stock_qty < need) {
      throw new Error(`Insufficient stock for ${it?.name ?? `item ${id}`}`);
    }
  }

  const total = subtotal; // line-level discounts already applied

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        user_id: userId,
        payment_method: paymentMethod,
        subtotal,
        discount: subtotal - total,
        total,
        address,
        phone,
        note,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // decrement stock + log movements
    for (const [id, need] of stockNeed) {
      await tx.item.update({
        where: { id },
        data: { stock_qty: { decrement: need } },
      });
      await tx.stockMovement.create({
        data: {
          item_id: id,
          change: -need,
          reason: "PURCHASE",
          note: `Order #${order.id}`,
        },
      });
    }

    // COD: pending until delivery. Online: pending until gateway verifies.
    await tx.transaction.create({
      data: {
        order_id: order.id,
        method: paymentMethod,
        status: "PENDING",
        amount: total,
      },
    });

    // clear cart only when ordering from cart
    if (!customLines || !customLines.length) {
      const cart = await tx.cart.findUnique({ where: { user_id: userId } });
      if (cart) await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });
    }

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: true, transactions: true },
    });
  });
};

export const getUserOrders = async (
  userId: number,
  perPage: number,
  skip: number,
) => {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { user_id: userId },
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: { items: true, transactions: true },
    }),
    prisma.order.count({ where: { user_id: userId } }),
  ]);
  return { orders, total };
};

export const findOrder = (id: number, userId?: number) =>
  prisma.order.findFirst({
    where: { id, ...(userId ? { user_id: userId } : {}) },
    include: { items: true, transactions: true },
  });

export const getAllOrders = async (
  perPage: number,
  skip: number,
  status: string | null,
) => {
  const where = status ? { status: status as any } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: { items: true, transactions: true },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total };
};

export const setOrderStatus = (id: number, status: any) =>
  prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true, transactions: true },
  });
