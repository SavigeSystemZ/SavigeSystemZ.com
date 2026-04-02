import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const apps = [
    {
      slug: "wireless-ops-suite",
      name: "Wireless Ops Suite",
      summary: "Advanced wireless assessment and operations platform.",
      visibility: "PUBLIC" as const,
      featured: true,
    },
    {
      slug: "stack-launcher",
      name: "Stack Launcher",
      summary: "Installer and orchestration utility for full development stacks.",
      visibility: "PUBLIC" as const,
      featured: false,
    },
  ];

  for (const app of apps) {
    await prisma.application.upsert({
      where: { slug: app.slug },
      create: app,
      update: {
        name: app.name,
        summary: app.summary,
        visibility: app.visibility,
        featured: app.featured,
      },
    });
  }

  const wireless = await prisma.application.findUnique({ where: { slug: "wireless-ops-suite" } });
  if (wireless) {
    await prisma.applicationVersion.upsert({
      where: {
        applicationId_version: {
          applicationId: wireless.id,
          version: "0.1.0",
        },
      },
      create: {
        applicationId: wireless.id,
        version: "0.1.0",
        changelog: "Initial seeded release placeholder for admin and download wiring.",
      },
      update: {
        changelog: "Initial seeded release placeholder for admin and download wiring.",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
