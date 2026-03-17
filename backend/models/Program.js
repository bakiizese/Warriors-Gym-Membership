import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Program extends Model {}

Program.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { modelName: "program", sequelize },
);

export default Program;
