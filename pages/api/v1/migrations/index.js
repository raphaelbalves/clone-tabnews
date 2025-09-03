import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOption = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOption);
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigratinons = await migrationRunner({
      ...defaultMigrationOption,
      dryRun: false,
    });

    await dbClient.end();

    if (migratedMigratinons.length > 0) {
      return response.status(201).json(migratedMigratinons);
    }

    return response.status(200).json(migratedMigratinons);
  }

  return response.status(405).end();
}
