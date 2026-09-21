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
  storage: new SequelizeStorage({ sequelize }),
  logger: env.isTest ? undefined : console,
});

export const runMigrations = () => migrator.up();
