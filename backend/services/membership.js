import { addDays } from "date-fns";
import { Op } from "sequelize";
import Membership from "../models/Membership.js";

export const LIVE_STATUSES = ["Active", "Payment Due"];

const SEVERITY = { Active: 0, "Payment Due": 1, Inactive: 2 };

// A renewal extends from whichever is later: the current end date or the
// payment date, so paying early never loses the days already bought.
export function nextEndDate(currentEnd, paidAt, durationDays) {
  const current = new Date(currentEnd);
  const base =
    !Number.isNaN(current.getTime()) && current > paidAt ? current : paidAt;
  return addDays(base, durationDays).toISOString();
}

// A member holds at most one live membership: starting a new one retires the rest.
export function deactivateLiveMemberships(memberId, { transaction } = {}) {
  return Membership.update(
    { status: "Inactive" },
    {
      where: { member_id: memberId, status: { [Op.in]: LIVE_STATUSES } },
      transaction,
    },
  );
}

export async function startMembership(
  { member, plan, startDate = new Date() },
  { transaction } = {},
) {
  await deactivateLiveMemberships(member.id, { transaction });
  return Membership.create(
    {
      member_id: member.id,
      membership_plan_id: plan.id,
      start_date: startDate.toISOString(),
      end_date: addDays(startDate, plan.duration_days).toISOString(),
      ticket: plan.ticket_amount ?? null,
      status: "Active",
    },
    { transaction },
  );
}

// `membership` must have its membershipPlan loaded.
export async function renewMembership(
  membership,
  { paidAt = new Date() } = {},
  { transaction } = {},
) {
  const plan = membership.membershipPlan;
  membership.end_date = nextEndDate(
    membership.end_date,
    paidAt,
    plan.duration_days,
  );
  if (plan.plan_type === "Ticket") {
    membership.ticket = (membership.ticket ?? 0) + (plan.ticket_amount ?? 0);
  }
  membership.status = "Active";
  await membership.save({ transaction });
  return membership;
}

// Worst of the date rule and (for ticket plans) the ticket rule.
export function resolveStatus({ daysLeft, remainingTicket }, planType) {
  let status = "Active";
  const raise = (candidate) => {
    if (SEVERITY[candidate] > SEVERITY[status]) status = candidate;
  };

  if (planType === "Ticket") {
    if (remainingTicket < 0) raise("Inactive");
    else if (remainingTicket < 3) raise("Payment Due");
  }
  if (daysLeft < 0) raise("Inactive");
  else if (daysLeft < 5) raise("Payment Due");

  return status;
}
