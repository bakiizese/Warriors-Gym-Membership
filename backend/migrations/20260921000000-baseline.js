import { DataTypes } from "sequelize";

// Baseline schema, captured from the tables Sequelize's sync() used to create.
// Every table is skipped if it already exists so a database that predates
// migrations adopts this baseline without being rebuilt.

const timestamps = {
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
};

const uuidPk = {
  id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
};

const cascadeRef = (table, column = "id") => ({
  model: table,
  key: column,
});

// tableExists() from Sequelize only looks in `public`, so ask Postgres to
// resolve the name through search_path instead.
async function tableMissing(queryInterface, name) {
  const [rows] = await queryInterface.sequelize.query(
    "SELECT to_regclass(:name) AS reg",
    { replacements: { name: `"${name}"` } },
  );
  return rows[0].reg === null;
}

async function createIfMissing(queryInterface, name, attributes) {
  if (await tableMissing(queryInterface, name)) {
    await queryInterface.createTable(name, attributes);
  }
}

export async function up({ context: queryInterface }) {
  await createIfMissing(queryInterface, "membership-plans", {
    ...uuidPk,
    membership_name: { type: DataTypes.STRING, allowNull: false },
    plan_type: { type: DataTypes.STRING, allowNull: false },
    ticket_amount: { type: DataTypes.INTEGER },
    duration_days: { type: DataTypes.INTEGER, allowNull: false },
    fee: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, allowNull: false },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "members", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    gender: { type: DataTypes.STRING, allowNull: false },
    height: { type: DataTypes.INTEGER, allowNull: false },
    weight: { type: DataTypes.INTEGER, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    activity_status: { type: DataTypes.STRING, defaultValue: "Inactive" },
    password: { type: DataTypes.STRING, allowNull: false },
    language: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING },
    workout_taken: { type: DataTypes.JSONB, defaultValue: [] },
    registration_Date: { type: DataTypes.STRING, allowNull: false },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "videos", {
    ...uuidPk,
    path: { type: DataTypes.STRING, allowNull: false },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "images", {
    ...uuidPk,
    path: { type: DataTypes.JSONB, allowNull: false },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "programs", {
    ...uuidPk,
    content: { type: DataTypes.STRING, allowNull: false },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "admins", {
    ...uuidPk,
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    admin_level: { type: DataTypes.STRING, allowNull: false },
    language: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "memberships", {
    ...uuidPk,
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: cascadeRef("members"),
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    membership_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: cascadeRef("membership-plans"),
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    start_date: { type: DataTypes.STRING, allowNull: false },
    end_date: { type: DataTypes.STRING, allowNull: false },
    ticket: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING, allowNull: false },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "attendance-logs", {
    ...uuidPk,
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: cascadeRef("members"),
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    membership_id: { type: DataTypes.UUID, allowNull: false },
    check_in: { type: DataTypes.STRING, allowNull: false },
    check_out: { type: DataTypes.STRING },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "transaction-histories", {
    ...uuidPk,
    payer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: cascadeRef("members"),
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    membershipPlan_id: { type: DataTypes.UUID, allowNull: false },
    payment_method: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    payment_for: { type: DataTypes.STRING, allowNull: false },
    paid_at: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    ...timestamps,
  });

  await createIfMissing(queryInterface, "workout-plans", {
    ...uuidPk,
    workout_title: { type: DataTypes.STRING, allowNull: false },
    video_id: {
      type: DataTypes.UUID,
      references: cascadeRef("videos"),
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    workout_type: { type: DataTypes.STRING, allowNull: false },
    workout_level: { type: DataTypes.STRING, allowNull: false },
    workout_rep: { type: DataTypes.INTEGER, allowNull: false },
    workout_sets: { type: DataTypes.INTEGER, allowNull: false },
    workout_break: { type: DataTypes.STRING, allowNull: false },
    ...timestamps,
  });
}

export async function down({ context: queryInterface }) {
  for (const table of [
    "workout-plans",
    "transaction-histories",
    "attendance-logs",
    "memberships",
    "admins",
    "programs",
    "images",
    "videos",
    "members",
    "membership-plans",
  ]) {
    await queryInterface.dropTable(table);
  }
}
