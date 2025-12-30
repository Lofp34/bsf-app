import { execSync } from "node:child_process";

const run = (command, env = process.env) =>
  execSync(command, { stdio: "inherit", env });

run("npx prisma generate");

const migrateUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (migrateUrl) {
  run("npx prisma migrate deploy", {
    ...process.env,
    DATABASE_URL: migrateUrl,
  });
} else {
  console.log("Skipping prisma migrate deploy: DATABASE_URL not set.");
}

run("next build");
