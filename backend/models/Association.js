import AttendanceLog from "./AttendanceLog.js";
import TransactionHistory from "./TransactionHistory.js";
import Member from "./Member.js";
import MembershipPlan from "./MembershipPlan.js";
import WorkoutPlan from "./WorkoutPlan.js";
import Image from "./Image.js";
import Video from "./Video.js";
import Admin from "./Admin.js";

const association = () => {
  //a memeber can have many attendance logs but an attendance log can only have one member - one to many
  Member.hasMany(AttendanceLog, {
    foreignKey: "member_id",
    as: "attendancelogs",
  });
  AttendanceLog.belongsTo(Member, {
    foreignKey: "member_id",
    as: "attendanceMember",
  });

  // a member can have many transaction histories but a transaction history can only have one member - one too many
  Member.hasMany(TransactionHistory, {
    foreignKey: "payer_id",
    as: "transactionHistories",
  });
  TransactionHistory.belongsTo(Member, {
    foreignKey: "payer_id",
    as: "payer",
  });

  //a member can only have one image and an image can only have one member - one to one
  Image.hasOne(Member, {
    foreignKey: "image_id",
    as: "memberOwner",
  });
  Member.belongsTo(Image, {
    foreignKey: "image_id",
    as: "image",
  });

  //a member can only have one membership plan but membershiplan can many members - one to many
  MembershipPlan.hasMany(Member, {
    foreignKey: "membership_plan_id",
    as: "members",
  });
  Member.belongsTo(MembershipPlan, {
    foreignKey: "membership_plan_id",
    as: "membershipPlan",
  });

  //an Image can only have one Admin and an Admin can only have one Image too - one to one
  Image.hasOne(Admin, {
    foreignKey: "image_id",
    as: "adminOwner",
  });
  Admin.belongsTo(Image, {
    foreignKey: "image_id",
    as: "image",
  });

  //an image can only have one workout plan and a workout plan can only have one image - one to one
  Image.hasOne(WorkoutPlan, {
    foreignKey: "image_id",
    as: "workoutPlan",
  });
  WorkoutPlan.belongsTo(Image, {
    foreignKey: "image_id",
    as: "image",
  });

  //aa video can only have one workout plan and a workout plan can only have one video - one to one
  Video.hasOne(WorkoutPlan, {
    foreignKey: "video_id",
    as: "workoutPlan",
  });
  WorkoutPlan.belongsTo(Video, {
    foreignKey: "video_id",
    as: "video",
  });
};

export default association;
