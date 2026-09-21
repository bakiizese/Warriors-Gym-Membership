// Where the live pieces are. The container writes /config.js at start, so one
// image can point at any environment; builds for static hosting use the
// VITE_* variables instead. Local defaults match docker-compose.yml.
export type ConfigKey =
  | "API_URL"
  | "ADMIN_WEB_URL"
  | "ADMIN_MOBILE_URL"
  | "MEMBER_MOBILE_URL"
  | "APK_ADMIN_URL"
  | "APK_MEMBER_URL"
  | "GITHUB_URL";

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<Record<ConfigKey, string>>;
  }
}

const defaults: Record<ConfigKey, string> = {
  API_URL: "http://localhost:5000",
  ADMIN_WEB_URL: "http://localhost:8080",
  ADMIN_MOBILE_URL: "http://localhost:8081",
  MEMBER_MOBILE_URL: "http://localhost:8082",
  // Empty until a release exists; the download buttons stay hidden.
  APK_ADMIN_URL: "",
  APK_MEMBER_URL: "",
  GITHUB_URL: "https://github.com/bakiizese/Warriors-Gym-Membership",
};

function read(key: ConfigKey): string {
  const runtime = window.__APP_CONFIG__?.[key];
  const build = import.meta.env[`VITE_${key}`] as string | undefined;
  return (runtime || build || defaults[key]).replace(/\/$/, "");
}

export const config = {
  apiUrl: read("API_URL"),
  adminWebUrl: read("ADMIN_WEB_URL"),
  adminMobileUrl: read("ADMIN_MOBILE_URL"),
  memberMobileUrl: read("MEMBER_MOBILE_URL"),
  apkAdminUrl: read("APK_ADMIN_URL"),
  apkMemberUrl: read("APK_MEMBER_URL"),
  githubUrl: read("GITHUB_URL"),
} as const;

/** True for an address only this machine can reach (no point putting it in a QR code). */
export const isLocalAddress = (url: string) => /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(url);
