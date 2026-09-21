// The API filters these columns on nearly every request (membership lookup,
// attendance history, payment history) but the baseline had no indexes on them.

const indexes = [
  { name: "memberships_member_id_status", table: "memberships", columns: ["member_id", "status"] },
  { name: "attendance_logs_member_id_membership_id", table: "attendance-logs", columns: ["member_id", "membership_id"] },
  { name: "transaction_histories_payer_id", table: "transaction-histories", columns: ["payer_id"] },
];

const quote = (identifier) => `"${identifier}"`;

export async function up({ context: queryInterface }) {
  for (const { name, table, columns } of indexes) {
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS ${quote(name)} ON ${quote(table)} (${columns.map(quote).join(", ")})`,
    );
  }
}

export async function down({ context: queryInterface }) {
  for (const { name } of indexes) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${quote(name)}`);
  }
}
