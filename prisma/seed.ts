import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/db/config";

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";
  const phone = process.env.ADMIN_PHONE ?? "9800000000";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  await prisma.user.create({
    data: {
      first_name: "Super",
      last_name: "Admin",
      email,
      phone,
      password: hash,
      role: "ADMIN",
      has_email_verified: true,
    },
  });

  console.log("Admin created:", email);
};

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
