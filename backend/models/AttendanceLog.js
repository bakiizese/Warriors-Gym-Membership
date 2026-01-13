import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class AttendanceLog extends Model {}

AttendanceLog.init(
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
    check_in: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    check_out: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "attendance-log",
  }
);

export default AttendanceLog;
