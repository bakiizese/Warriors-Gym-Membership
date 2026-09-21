// Usage: node scripts/migrate.js [up|down|status]
import sequelize from "../config/database.js";
import { migrator } from "../config/migrator.js";

const command = process.argv[2] ?? "up";

try {
  if (command === "up") {
    await migrator.up();
  } else if (command === "down") {
    await migrator.down();
  } else if (command === "status") {
    const executed = await migrator.executed();
    const pending = await migrator.pending();
    console.log("executed:", executed.map((m) => m.name));
    console.log("pending: ", pending.map((m) => m.name));
  } else {
    console.error(`unknown command "${command}", use up | down | status`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error("migration failed", err);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
