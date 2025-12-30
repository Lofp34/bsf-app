import { execSync } from "node:child_process";

const run = (command, env = process.env) =>
  execSync(command, { stdio: "inherit", env });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runWithRetry(command, env, attempts = 3, delayMs = 3000) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      run(command, env);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        console.log(`Retrying: ${command} (${attempt}/${attempts})`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

run("npx prisma generate");

const migrateUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (migrateUrl) {
  await runWithRetry(
    "npx prisma migrate deploy",
    {
      ...process.env,
      DATABASE_URL: migrateUrl,
    },
    3,
    5000,
  );
} else {
  console.log("Skipping prisma migrate deploy: DATABASE_URL not set.");
}

run("next build");
