import AttendanceLog from "../models/AttendanceLog.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Pass the surrounding DB transaction so counts include rows written in it.
export const membershipCalculate = async (
  membership,
  memberId,
  { transaction } = {},
) => {
  const now = new Date();

  const end = new Date(membership?.end_date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const daysLeft = Math.floor((endDay - today) / MS_PER_DAY);
  const membershipJson = membership.toJSON();

  if (membership.membershipPlan.plan_type === "Ticket") {
    const attendance = await AttendanceLog.count({
      where: { member_id: memberId, membership_id: membership.id },
      transaction,
    });
    membershipJson.remainingTicket = membership.ticket - attendance;
  }
  membershipJson.daysLeft = daysLeft;

  return membershipJson;
};
