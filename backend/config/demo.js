import { env } from "./env.js";

export const demoAccounts = Object.freeze({
  admin: { phone: env.DEMO_ADMIN_PHONE, password: env.DEMO_ADMIN_PASSWORD },
  member: { phone: env.DEMO_MEMBER_PHONE, password: env.DEMO_MEMBER_PASSWORD },
});

// In demo mode the two published logins must keep working for the next
// visitor, so their credentials and the accounts themselves are read-only.
export function isDemoLocked(user) {
  return (
    env.DEMO_MODE &&
    [demoAccounts.admin.phone, demoAccounts.member.phone].includes(
      user?.phone_number,
    )
  );
}
