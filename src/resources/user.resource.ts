import { User } from "../../generated/prisma/client";

export const UserResponse = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at
  };
};
