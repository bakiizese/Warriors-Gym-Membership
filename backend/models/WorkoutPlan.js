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
    image_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    video_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    workout_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workout_detail_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workout_level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workout_step_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workout_rep: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_step: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_break: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, modelName: "workout-plan" }
);

export default WorkoutPlan;
