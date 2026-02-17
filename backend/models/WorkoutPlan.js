import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class WorkoutPlan extends Model {}

WorkoutPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    workout_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //allownull must be false
    video_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    workout_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workout_level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workout_rep: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_break: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "workout-plan" },
);

export default WorkoutPlan;
