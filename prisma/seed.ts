import bcrypt from "bcryptjs";
import { prisma } from "../src/database/prisma";

async function main() {
  console.log("Seeding admin user...");

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const name = process.env.ADMIN_NAME || "Administrator";
  const plainPassword = process.env.ADMIN_PASSWORD || "Admin@123!";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "ADMIN" },
    create: {
      name,
      email,
      emailVerified: true,
      role: "ADMIN",
    },
  });

  // Ensure an account record exists with a hashed password so admin can sign in
  const hashed = await bcrypt.hash(plainPassword, 10);

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: hashed, providerId: "credentials", accountId: email },
    });
  } else {
    await prisma.account.create({
      data: {
        accountId: email,
        providerId: "credentials",
        userId: user.id,
        password: hashed,
      },
    });
  }

  console.log("Admin credentials:", { email, password: plainPassword });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
