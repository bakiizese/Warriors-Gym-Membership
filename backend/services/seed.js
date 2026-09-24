import sequelize from "../config/database.js";
import { demoAccounts } from "../config/demo.js";
import Admin from "../models/Admin.js";
import AttendanceLog from "../models/AttendanceLog.js";
import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Program from "../models/Program.js";
import TransactionHistory from "../models/TransactionHistory.js";
import Video from "../models/Video.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import { hash_password } from "../utils/password.js";
import { resolveStatus } from "./membership.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const APP_TABLES = [
  "admins",
  "members",
  "memberships",
  "membership-plans",
  "attendance-logs",
  "transaction-histories",
  "workout-plans",
  "videos",
  "images",
  "programs",
]
  .map((table) => `"${table}"`)
  .join(", ");

const PLANS = [
  { key: "monthly", membership_name: "Monthly", plan_type: "Daily", duration_days: 30, fee: 1500, description: "Unlimited access for 30 days", status: "Active" },
  { key: "quarterly", membership_name: "Quarterly", plan_type: "Daily", duration_days: 90, fee: 4000, description: "Unlimited access for 90 days, best value", status: "Active" },
  { key: "tickets", membership_name: "10 Visit Pass", plan_type: "Ticket", ticket_amount: 10, duration_days: 60, fee: 1000, description: "Ten visits, valid for 60 days", status: "Active" },
  { key: "legacy", membership_name: "Legacy Weekly", plan_type: "Daily", duration_days: 7, fee: 500, description: "No longer offered", status: "Inactive" },
];

// `visits` are hours ago. Status is derived from the same rules the check-in
// endpoint uses, so the sample data never contradicts the app's own logic.
const MEMBERS = [
  { name: "Demo Member", phone: "demo", gender: "male", height: 178, weight: 76, age: 27, plan: "monthly", endsInDays: 18, visits: [48, 96, 144, 216, 264] },
  { name: "Abel Tesfaye", gender: "male", height: 182, weight: 84, age: 31, plan: "monthly", endsInDays: 25, visits: [3, 30, 78, 126] },
  { name: "Selam Bekele", gender: "female", height: 165, weight: 58, age: 24, plan: "monthly", endsInDays: 3, visits: [5, 52, 100] },
  { name: "Dawit Alemu", gender: "male", height: 175, weight: 79, age: 35, plan: "quarterly", endsInDays: 70, visits: [2, 27, 75, 120] },
  { name: "Hana Girma", gender: "female", height: 168, weight: 61, age: 29, plan: "tickets", endsInDays: 40, visits: [10, 34, 58, 82, 106, 130, 154, 178] },
  { name: "Yonas Kebede", gender: "male", height: 180, weight: 88, age: 40, plan: "tickets", endsInDays: 45, visits: [20, 90, 160] },
  { name: "Marta Solomon", gender: "female", height: 160, weight: 55, age: 26, plan: "monthly", endsInDays: -12, visits: [400, 430] },
  { name: "Samuel Haile", gender: "male", height: 172, weight: 70, age: 22, plan: "monthly", endsInDays: 9, visits: [8, 60] },
  { name: "Liya Mekonnen", gender: "female", height: 163, weight: 57, age: 23, plan: null, endsInDays: 0, visits: [] },
  { name: "Biruk Tadesse", gender: "male", height: 185, weight: 90, age: 33, plan: "monthly", endsInDays: 28, visits: [1, 26, 50] },
  { name: "Ruth Assefa", gender: "female", height: 170, weight: 63, age: 28, plan: "monthly", endsInDays: 4, visits: [12, 40] },
  { name: "Eyob Negash", gender: "male", height: 177, weight: 81, age: 37, plan: "quarterly", endsInDays: 45, visits: [6, 30, 54, 102] },
];

// The apps sort a workout type's steps by Number(level) and print the break as
// "<rest> mins break", so `level` is the step number and `rest` is in minutes.
const WORKOUTS = [
  { type: "Chest", title: "Cable Seated Chest Fly", level: "1", rep: 12, sets: 3, rest: "1", file: "chest-cable-fly.mp4" },
  { type: "Back", title: "Seated Row", level: "1", rep: 12, sets: 3, rest: "1", file: "back-seated-row.mp4" },
  { type: "Shoulder", title: "Standing Single Delt Row", level: "1", rep: 10, sets: 3, rest: "1", file: "shoulder-delt-row.mp4" },
  { type: "Arm", title: "One Arm Triceps Extension", level: "1", rep: 12, sets: 3, rest: "0.75", file: "arm-triceps-extension.mp4" },
  { type: "Abs", title: "Front Plank", level: "1", rep: 1, sets: 3, rest: "0.75", file: "abs-front-plank.mp4" },
  { type: "Glute & Hamstring", title: "Cable Donkey Kickback", level: "1", rep: 15, sets: 3, rest: "1", file: "glute-donkey-kickback.mp4" },

  { type: "Chest", title: "Push-Up", level: "2", rep: 15, sets: 3, rest: "1", file: "chest-push-up.mp4" },
  { type: "Chest", title: "Dumbbell Bench Press", level: "3", rep: 10, sets: 3, rest: "1.5", file: "chest-dumbbell-bench-press.mp4" },
  { type: "Chest", title: "Incline Fly", level: "4", rep: 12, sets: 3, rest: "1", file: "chest-incline-fly.mp4" },
  { type: "Chest", title: "Incline Bench Press", level: "5", rep: 8, sets: 4, rest: "2", file: "chest-incline-bench-press.mp4" },
  { type: "Chest", title: "Bench Press", level: "6", rep: 8, sets: 4, rest: "2", file: "chest-bench-press.mp4" },

  { type: "Back", title: "Lat Pulldown", level: "2", rep: 12, sets: 3, rest: "1", file: "back-pulldown.mp4" },
  { type: "Back", title: "One Arm Row", level: "3", rep: 10, sets: 3, rest: "1", file: "back-one-arm-row.mp4" },
  { type: "Back", title: "Bent Over Row", level: "4", rep: 10, sets: 3, rest: "1.5", file: "back-bent-over-row.mp4" },
  { type: "Back", title: "Pull-Up", level: "5", rep: 8, sets: 3, rest: "1.5", file: "back-pull-up.mp4" },
  { type: "Back", title: "Barbell Deadlift", level: "6", rep: 5, sets: 4, rest: "2", file: "back-deadlift.mp4" },

  { type: "Shoulder", title: "Lateral Raise", level: "2", rep: 12, sets: 3, rest: "1", file: "shoulder-lateral-raise.mp4" },
  { type: "Shoulder", title: "Front Raise", level: "3", rep: 12, sets: 3, rest: "1", file: "shoulder-front-raise.mp4" },
  { type: "Shoulder", title: "Dumbbell Rear Delt Fly", level: "4", rep: 12, sets: 3, rest: "1", file: "shoulder-rear-delt-fly.mp4" },
  { type: "Shoulder", title: "Seated Shoulder Press", level: "5", rep: 10, sets: 3, rest: "1.5", file: "shoulder-seated-press.mp4" },
  { type: "Shoulder", title: "Dumbbell Arnold Press", level: "6", rep: 8, sets: 3, rest: "1.5", file: "shoulder-arnold-press.mp4" },

  { type: "Arm", title: "Triceps Pushdown", level: "2", rep: 12, sets: 3, rest: "0.75", file: "arm-triceps-pushdown.mp4" },
  { type: "Arm", title: "Hammer Curl", level: "3", rep: 12, sets: 3, rest: "0.75", file: "arm-hammer-curl.mp4" },
  { type: "Arm", title: "Barbell Curl", level: "4", rep: 10, sets: 3, rest: "1", file: "arm-barbell-curl.mp4" },
  { type: "Arm", title: "Preacher Curl", level: "5", rep: 10, sets: 3, rest: "1", file: "arm-preacher-curl.mp4" },
  { type: "Arm", title: "Lying Triceps Extension (Skull Crusher)", level: "6", rep: 10, sets: 3, rest: "1", file: "arm-skull-crusher.mp4" },

  { type: "Abs", title: "Crunch", level: "2", rep: 20, sets: 3, rest: "0.75", file: "abs-crunch.mp4" },
  { type: "Abs", title: "Russian Twist", level: "3", rep: 20, sets: 3, rest: "0.75", file: "abs-russian-twist.mp4" },
  { type: "Abs", title: "Lying Leg Raise", level: "4", rep: 12, sets: 3, rest: "0.75", file: "abs-lying-leg-raise.mp4" },
  { type: "Abs", title: "Side Plank", level: "5", rep: 1, sets: 3, rest: "0.75", file: "abs-side-plank.mp4" },
  { type: "Abs", title: "Hollow Hold", level: "6", rep: 1, sets: 3, rest: "0.75", file: "abs-hollow-hold.mp4" },

  { type: "Glute & Hamstring", title: "Dumbbell Glute Bridge", level: "2", rep: 15, sets: 3, rest: "1", file: "glute-bridge.mp4" },
  { type: "Glute & Hamstring", title: "Lunge", level: "3", rep: 12, sets: 3, rest: "1", file: "glute-lunge.mp4" },
  { type: "Glute & Hamstring", title: "Good Morning", level: "4", rep: 10, sets: 3, rest: "1.5", file: "hamstring-good-morning.mp4" },
  { type: "Glute & Hamstring", title: "Romanian Deadlift", level: "5", rep: 10, sets: 3, rest: "1.5", file: "glute-romanian-deadlift.mp4" },
  { type: "Glute & Hamstring", title: "Barbell Hip Thrust", level: "6", rep: 10, sets: 4, rest: "2", file: "glute-hip-thrust.mp4" },

  { type: "Quad", title: "Dumbbell Goblet Squat", level: "1", rep: 12, sets: 3, rest: "1", file: "quad-goblet-squat.mp4" },
  { type: "Quad", title: "Squat", level: "2", rep: 10, sets: 4, rest: "2", file: "quad-squat.mp4" },
  { type: "Quad", title: "Dumbbell Walking Lunges", level: "3", rep: 12, sets: 3, rest: "1", file: "quad-walking-lunges.mp4" },
  { type: "Quad", title: "Dumbbell Bulgarian Split Squat", level: "4", rep: 10, sets: 3, rest: "1.5", file: "quad-bulgarian-split-squat.mp4" },
  { type: "Quad", title: "Sled Hack Squat", level: "5", rep: 10, sets: 3, rest: "1.5", file: "quad-hack-squat.mp4" },
  { type: "Quad", title: "Dumbbell Front Squat", level: "6", rep: 8, sets: 4, rest: "2", file: "quad-front-squat.mp4" },

  { type: "Calf", title: "Standing Calf Raise", level: "1", rep: 15, sets: 3, rest: "0.75", file: "calf-standing-raise.mp4" },
  { type: "Calf", title: "Seated Calf Raise", level: "2", rep: 15, sets: 3, rest: "0.75", file: "calf-seated-raise.mp4" },
  { type: "Calf", title: "Dumbbell Single Leg Calf Raise", level: "3", rep: 12, sets: 3, rest: "0.75", file: "calf-single-leg-raise.mp4" },
  { type: "Calf", title: "Hack Calf Raise", level: "4", rep: 12, sets: 3, rest: "1", file: "calf-hack-raise.mp4" },
  { type: "Calf", title: "Sled Calf Press on Leg Press", level: "5", rep: 15, sets: 4, rest: "1", file: "calf-sled-press.mp4" },
];

const PROGRAMS = [
  "https://example.com/programs/beginner-strength",
  "https://example.com/programs/fat-loss-4-weeks",
  "https://example.com/programs/mobility-and-recovery",
];

/**
 * Fills an empty database with a believable gym: plans, members in every
 * membership state, attendance, payments, workouts and programs.
 *
 * Without `reset` it does nothing if any admin already exists, so it is safe
 * to call on every boot. With `reset` it wipes every table first.
 */
export async function seedDemoData({ reset = false } = {}) {
  return sequelize.transaction(async (transaction) => {
    if (reset) {
      await sequelize.query(`TRUNCATE ${APP_TABLES} RESTART IDENTITY CASCADE`, {
        transaction,
      });
    } else if ((await Admin.count({ transaction })) > 0) {
      return { seeded: false };
    }

    const now = Date.now();
    const adminHash = await hash_password(demoAccounts.admin.password);
    const memberHash = await hash_password(demoAccounts.member.password);

    await Admin.create(
      {
        full_name: "Demo Admin",
        phone_number: demoAccounts.admin.phone,
        password: adminHash,
        admin_level: "Admin",
        language: "English",
      },
      { transaction },
    );

    const planRows = await MembershipPlan.bulkCreate(
      PLANS.map(({ key: _key, ...plan }) => plan),
      { transaction },
    );
    const planByKey = Object.fromEntries(PLANS.map((p, i) => [p.key, planRows[i]]));

    // Everything below is derived per member first, then written in bulk.
    const derived = MEMBERS.map((spec, index) => {
      const plan = spec.plan ? planByKey[spec.plan] : null;
      const end = plan ? new Date(now + spec.endsInDays * DAY) : null;
      const start = plan ? new Date(end.getTime() - plan.duration_days * DAY) : null;
      const remainingTicket =
        plan?.plan_type === "Ticket" ? plan.ticket_amount - spec.visits.length : undefined;
      const status = plan
        ? resolveStatus({ daysLeft: spec.endsInDays, remainingTicket }, plan.plan_type)
        : "Inactive";
      const phone =
        spec.phone === "demo"
          ? demoAccounts.member.phone
          : `09110001${String(index + 1).padStart(2, "0")}`;
      return { spec, plan, start, end, status, phone };
    });

    const members = await Member.bulkCreate(
      derived.map(({ spec, start, status, phone }) => ({
        full_name: spec.name,
        phone_number: phone,
        gender: spec.gender,
        height: spec.height,
        weight: spec.weight,
        age: spec.age,
        password: memberHash,
        language: "English",
        activity_status: status,
        registration_Date: (start ?? new Date(now - 5 * DAY)).toISOString().slice(0, 10),
      })),
      { transaction },
    );

    const withPlan = derived
      .map((d, i) => ({ ...d, member: members[i] }))
      .filter((d) => d.plan);

    const memberships = await Membership.bulkCreate(
      withPlan.map(({ member, plan, start, end, status }) => ({
        member_id: member.id,
        membership_plan_id: plan.id,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        ticket: plan.ticket_amount ?? null,
        status,
        createdAt: start,
      })),
      { transaction },
    );

    await AttendanceLog.bulkCreate(
      withPlan.flatMap(({ spec, member }, i) =>
        spec.visits.map((hoursAgo) => ({
          member_id: member.id,
          membership_id: memberships[i].id,
          check_in: new Date(now - hoursAgo * HOUR).toISOString(),
          createdAt: new Date(now - hoursAgo * HOUR),
        })),
      ),
      { transaction },
    );

    const payments = withPlan.map(({ member, plan, start }, i) => ({
      payer_id: member.id,
      membershipPlan_id: plan.id,
      payment_method: i % 2 === 0 ? "Cash-Demo Admin" : "Chapa",
      amount: plan.fee,
      payment_for: plan.membership_name,
      paid_at: start.toISOString(),
      status: "Successfull",
      createdAt: start,
    }));
    // The demo member also has last cycle's payment, so their history is not a single row.
    const demo = withPlan.find(({ spec }) => spec.phone === "demo");
    const previous = new Date(demo.start.getTime() - demo.plan.duration_days * DAY);
    payments.push({
      payer_id: demo.member.id,
      membershipPlan_id: demo.plan.id,
      payment_method: "Cash-Demo Admin",
      amount: demo.plan.fee,
      payment_for: demo.plan.membership_name,
      paid_at: previous.toISOString(),
      status: "Successfull",
      createdAt: previous,
    });
    await TransactionHistory.bulkCreate(payments, { transaction });

    const videos = await Video.bulkCreate(
      WORKOUTS.map(({ file }) => ({ path: `seed-assets/videos/${file}` })),
      { transaction },
    );
    await WorkoutPlan.bulkCreate(
      WORKOUTS.map((w, i) => ({
        workout_title: w.title,
        workout_type: w.type,
        workout_level: w.level,
        workout_rep: w.rep,
        workout_sets: w.sets,
        workout_break: w.rest,
        video_id: videos[i].id,
      })),
      { transaction },
    );

    await Program.bulkCreate(
      PROGRAMS.map((content) => ({ content })),
      { transaction },
    );

    return {
      seeded: true,
      plans: planRows.length,
      members: members.length,
      memberships: memberships.length,
      workouts: WORKOUTS.length,
    };
  });
}
