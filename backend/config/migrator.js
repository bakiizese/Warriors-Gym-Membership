import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Umzug, SequelizeStorage } from "umzug";
import sequelize from "./database.js";
import { env } from "./env.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.js", { cwd: root }],
    // Migrations are ES modules; umzug's default resolver expects CommonJS.
    resolve: ({ name, path: filePath, context }) => {
      const load = () => import(pathToFileURL(filePath).href);
      return {
        name,
        up: async () => (await load()).up({ context }),
        down: async () => (await load()).down({ context }),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  // Without an explicit schema, Sequelize decides whether SequelizeMeta exists by
  // looking only in `public`, so a SequelizeMeta there (from a normal dev run)
  // makes it skip creating one in the schema DATABASE_SCHEMA points at.
  storage: new SequelizeStorage({ sequelize, schema: env.DATABASE_SCHEMA }),
  logger: env.isTest ? undefined : console,
});

export const runMigrations = () => migrator.up();
