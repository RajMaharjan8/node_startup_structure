import prisma from "../db/config";

const getOrCreateCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({ where: { user_id: userId } });
  if (cart) return cart;
  return prisma.cart.create({ data: { user_id: userId } });
};

export const getCart = async (userId: number) => {
  const cart = await getOrCreateCart(userId);
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: true },
  });
};

export const addToCart = async (
  userId: number,
  itemId: number | null,
  packageId: number | null,
  quantity: number,
) => {
  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findFirst({
    where: { cart_id: cart.id, item_id: itemId, package_id: packageId },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    });
  }

  return prisma.cartItem.create({
    data: { cart_id: cart.id, item_id: itemId, package_id: packageId, quantity },
  });
};

export const updateCartItem = async (
  userId: number,
  cartItemId: number,
  quantity: number,
) => {
  const cart = await getOrCreateCart(userId);
  return prisma.cartItem.updateMany({
    where: { id: cartItemId, cart_id: cart.id },
    data: { quantity },
  });
};

export const removeCartItem = async (userId: number, cartItemId: number) => {
  const cart = await getOrCreateCart(userId);
  return prisma.cartItem.deleteMany({
    where: { id: cartItemId, cart_id: cart.id },
  });
};

export const clearCart = async (userId: number) => {
  const cart = await getOrCreateCart(userId);
  return prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
};
