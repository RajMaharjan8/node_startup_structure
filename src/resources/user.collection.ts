import { User } from "../../generated/prisma/client";
import { UserResponse } from "./user.resource";

export const UserCollection = (
  users: User[],
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  },
) => {
  return {
    data: users.map(UserResponse),

    pagination,
  };
};
