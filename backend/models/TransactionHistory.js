import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class TransactionHistory extends Model {}

TransactionHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    payer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    membershipPlan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_for: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paid_at: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "transaction-history",
  },
);

export default TransactionHistory;
