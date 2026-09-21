import { uploadSize } from "./files.js";

// { workout_type: [plan, ...] }. With withSizes, each video also gets its file
// size (0 when the file is not on disk, so one missing file cannot break the list).
export async function groupWorkoutsByType(plans, { withSizes = false } = {}) {
  const grouped = {};
  for (const plan of plans) {
    if (withSizes && plan.video) {
      plan.video.dataValues.size = await uploadSize(plan.video.path);
    }
    (grouped[plan.workout_type] ??= []).push(plan);
  }
  return grouped;
}
