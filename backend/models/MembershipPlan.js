import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class MembershipPlan extends Model {}

MembershipPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    membership_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "membership-plan" }
);

export default MembershipPlan;
