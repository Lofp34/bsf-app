import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const memberCount = await prisma.member.count();
  if (memberCount > 0) {
    console.log("Seed ignore: membres deja presents.");
    return;
  }

  const [adminMember, userMember] = await prisma.$transaction([
    prisma.member.create({
      data: {
        firstname: "Camille",
        lastname: "Morel",
        company: "Atelier Sud",
        email: "camille.morel@example.com",
        phone: "+33 6 12 34 56 78",
      },
    }),
    prisma.member.create({
      data: {
        firstname: "Lina",
        lastname: "Bernard",
        company: "Rivage Conseil",
        email: "lina.bernard@example.com",
      },
    }),
  ]);

  const adminUser = await prisma.user.create({
    data: {
      memberId: adminMember.id,
      authEmail: "admin@bsf.local",
      role: "SUPER_ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      memberId: userMember.id,
      authEmail: "user@bsf.local",
      role: "USER",
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.event.create({
    data: {
      createdByUserId: adminUser.id,
      title: "Rencontre Business Sud",
      type: "Networking",
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Montpellier",
      description: "Session de mise en relation entre membres.",
      capacity: 40,
      status: "PUBLISHED",
    },
  });

  console.log("Seed demo terminee.");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
