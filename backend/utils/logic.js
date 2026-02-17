import AttendanceLog from "../models/AttendanceLog.js";

export const membershipCalculate = async (membership, memberId) => {
  const now = new Date();
  // const now = new Date("2026-03-12T13:48:36.601Z");

  const end = new Date(membership?.end_date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const daysLeft = Math.floor((endDay - today) / (1000 * 60 * 60 * 24));
  const membershipJson = membership.toJSON();

  if (membership.membershipPlan.plan_type === "Ticket") {
    const attendance = await AttendanceLog.count({
      where: { member_id: memberId, membership_id: membership.id },
    });
    const remainingTicket = membership.ticket - attendance;
    membershipJson.remainingTicket = remainingTicket;
  }
  membershipJson.daysLeft = daysLeft;

  return membershipJson;
};
