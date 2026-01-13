import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Image extends Model {}

Image.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    path: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  { sequelize, modelName: "image" }
);

export default Image;
