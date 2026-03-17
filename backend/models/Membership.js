import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Membership extends Model {}

Membership.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    membership_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ticket: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "membership",
  },
);

export default Membership;
