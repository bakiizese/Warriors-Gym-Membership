import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Video extends Model {}

Video.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "video" },
);

export default Video;
