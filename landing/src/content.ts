// All the words and numbers on the page live here, so they are easy to keep true.
// The demo logins mirror the backend's DEMO_* defaults (backend/.env.example).

export const contact = {
  name: "Bereket Zeselassie",
  email: "bereketzeselassie@gmail.com",
  linkedin: "https://www.linkedin.com/in/bereket-zeselassie-embaye",
  telegram: "https://t.me/bereket_zeselassie",
  github: "https://github.com/bakiizese",
} as const;

export const passes = {
  admin: { who: "Demo Admin", role: "Staff", phone: "0900000001", password: "demo1234" },
  member: { who: "Demo Member", role: "Member", phone: "0911000001", password: "demo1234" },
} as const;

export type PassKey = keyof typeof passes;

// Keep these true. endpoints: operations in backend/docs/openapi.yaml. tests: the
// backend suite (`make test`). ciChecks: check runs on a pull request that touches
// every part of the repo (see .github/workflows/ci.yml, codeql.yml and secrets.yml).
export const stats = {
  apps: 3,
  endpoints: 44,
  tests: 99,
  ciChecks: 12,
} as const;

export const hero = {
  eyebrow: "Live demo",
  eyebrowNote: "Data resets every night",
  lines: ["One gym.", "Three apps.", "One API."],
  lede: "A gym membership system I built end to end: an Express and PostgreSQL API, a React admin panel, and two React Native apps, one for staff and one for members. It is all running below. Sign in with a demo pass and try to break it.",
} as const;

export type DoorId = "admin-web" | "admin-mobile" | "member-mobile";

export const doors: ReadonlyArray<{
  id: DoorId;
  kicker: string;
  title: string;
  body: string;
  stack: readonly string[];
  shot: string;
  shotAlt: string;
  pass: PassKey;
  frame: "browser" | "phone";
}> = [
  {
    id: "admin-web",
    kicker: "Front desk",
    title: "Admin Web",
    body: "What staff use at the desk: members, payments, plans, workouts and attendance in one place.",
    stack: ["React 19", "Vite", "Tailwind"],
    shot: "/screens/admin-web.webp",
    shotAlt: "The Manage Members table in the admin web app",
    pass: "admin",
    frame: "browser",
  },
  {
    id: "admin-mobile",
    kicker: "On the gym floor",
    title: "Admin Mobile",
    body: "Scan a member's QR code to check them in, take a payment, and keep working when the signal drops.",
    stack: ["Expo", "React Native", "expo-camera"],
    shot: "/screens/admin-dashboard.webp",
    shotAlt: "The admin mobile dashboard with today's visit counts",
    pass: "admin",
    frame: "phone",
  },
  {
    id: "member-mobile",
    kicker: "For members",
    title: "Member Mobile",
    body: "Workout videos, membership status, payments and attendance, with the last data it saw still there offline.",
    stack: ["Expo", "React Native", "i18n (3 languages)"],
    shot: "/screens/member-dashboard.webp",
    shotAlt: "The member dashboard with the attendance strip and membership status",
    pass: "member",
    frame: "phone",
  },
];

export const tours = {
  member: [
    "Sign in, then open Pay and renew your membership. A payment is recorded and your days left grow.",
    "Open Programs and Competitions to read what the admin published.",
    "Sign out and back in. An expired or rejected token sends you to the sign-in screen by itself.",
  ],
  admin: [
    "Open Manage Members and add a member, with a photo if you like.",
    "Open Manage Payments and add a transaction for that member.",
    "Open Manage Membership Plans and change a price, then look at it in the member app.",
  ],
} as const;

export const requestLog: ReadonlyArray<readonly [string, string, string]> = [
  ["POST", "/auth/sign-in/member", "200"],
  ["GET", "/member/membership", "200"],
  ["POST", "/member/membership/off", "200"],
  ["POST", "/admin/memberAttendance/:id", "200"],
  ["POST", "/admin/transaction", "201"],
];

export const ciChecks = [
  "ESLint on every app",
  "Vitest against real Postgres",
  "Trivy image scan",
  "CodeQL",
  "gitleaks secret scan",
  "Docker stack smoke test",
  "Expo web export",
] as const;

export const notes: ReadonlyArray<{ tag: string; title: string; body: string }> = [
  {
    tag: "Simulated",
    title: "Payments are pretend.",
    body: "The checkout records a payment and renews the membership, but no money moves. A Chapa sandbox integration is stubbed for later.",
  },
  {
    tag: "Sleepy",
    title: "Free hosting naps.",
    body: "The API sleeps when idle and can take about 30 seconds to wake. The status light at the top says which state it is in.",
  },
  {
    tag: "Temporary",
    title: "Uploads do not last.",
    body: "Photos and videos you add live on the server's disk, which the free tier wipes on a restart. The sample clips are baked into the image.",
  },
  {
    tag: "Shared",
    title: "Everyone uses the same accounts.",
    body: "The two demo logins are locked, so you can change any data but not the login itself, and nobody can lock the next visitor out.",
  },
  {
    tag: "Debug-signed",
    title: "The Android builds are not from the Play Store.",
    body: "They are signed with a debug key, so Android asks you to allow an unknown source before installing.",
  },
];
