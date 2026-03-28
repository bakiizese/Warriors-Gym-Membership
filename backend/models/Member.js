import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Member extends Model {}

Member.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: { max: 99999 },
      get() {
        const rawValue = this.getDataValue("id");
        if (rawValue == null) return null;
        return String(rawValue).padStart(5, "0");
      },
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activity_status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Inactive",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workout_taken: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    registration_Date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "member",
  },
);

export default Member;
