import { Sequelize } from "sequelize";
import { env } from "./env.js";

const dialectOptions = {};
if (env.DATABASE_SSL) {
  dialectOptions.ssl = { require: true };
}
if (env.DATABASE_SCHEMA) {
  dialectOptions.options = `-c search_path=${env.DATABASE_SCHEMA}`;
}

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions,
});

export default sequelize;
