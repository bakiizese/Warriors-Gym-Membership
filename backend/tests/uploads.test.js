import fs from "fs";
import path from "path";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import Video from "../models/Video.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import { uploadsRoot } from "../services/files.js";
import {
  adminCreds,
  api,
  bearer,
  closeDb,
  createAdmin,
  createMember,
  memberCreds,
  resetDb,
  signIn,
} from "./helpers.js";

const dirs = ["images", "videos"].map((d) => path.join(uploadsRoot, d));
const listUploads = () =>
  dirs.flatMap((dir) =>
    fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => path.join(dir, f)) : [],
  );

let before;
let auth;

beforeEach(async () => {
  await resetDb();
  await createAdmin();
  auth = bearer(await signIn("admin", adminCreds));
  dirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
  before = new Set(listUploads());
});

// uploadsRoot is a per-run temp dir (see globalSetup); clear each test's files.
afterEach(() => {
  for (const file of listUploads()) {
    if (!before.has(file)) fs.rmSync(file, { force: true });
  }
});
afterAll(closeDb);

const newFiles = () => listUploads().filter((f) => !before.has(f));

const workoutMetadata = {
  workout_title: "Squat",
  workout_type: "Quad",
  workout_level: "Beginner",
  workout_rep: 10,
  workout_sets: 3,
  workout_break: "60s",
};

const postWorkout = (metadata = workoutMetadata, file = { name: "clip.mp4", type: "video/mp4" }) => {
  const req = api().post("/admin/workout").set(auth).field("metadata", JSON.stringify(metadata));
  return file
    ? req.attach("file", Buffer.from("not really a video"), {
        filename: file.name,
        contentType: file.type,
      })
    : req;
};

describe("upload safety", () => {
  it("never writes a file for an unauthenticated request", async () => {
    const res = await api()
      .post("/admin/workout")
      .field("metadata", JSON.stringify(workoutMetadata))
      .attach("file", Buffer.from("x"), { filename: "evil.mp4", contentType: "video/mp4" });
    expect(res.status).toBe(401);
    expect(newFiles()).toEqual([]);
  });

  it("stores uploads under a generated name inside uploads/, ignoring the client's", async () => {
    const res = await postWorkout(workoutMetadata, { name: "../../../etc/evil name.mp4", type: "video/mp4" });
    expect(res.status).toBe(201);

    const [file] = newFiles();
    expect(file.startsWith(path.join(uploadsRoot, "videos") + path.sep)).toBe(true);
    expect(path.basename(file)).toMatch(/^\d+-[0-9a-f-]{36}\.mp4$/);

    // The DB holds the URL-facing path the apps prefix with the server address,
    // independent of where UPLOADS_DIR points on disk.
    const video = await Video.findOne();
    expect(video.path).toBe(`uploads/videos/${path.basename(file)}`);
  });

  it("rejects disallowed file types and leaves nothing behind", async () => {
    const res = await postWorkout(workoutMetadata, { name: "script.sh", type: "application/x-sh" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid file type");
    expect(newFiles()).toEqual([]);
  });

  it("rejects an image where a video is required, and cleans it up", async () => {
    const res = await postWorkout(workoutMetadata, { name: "pic.jpg", type: "image/jpeg" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("file must be a video");
    expect(newFiles()).toEqual([]);
    expect(await WorkoutPlan.count()).toBe(0);
  });

  it("removes the uploaded file when validation of the rest of the request fails", async () => {
    const { workout_title: _drop, ...incomplete } = workoutMetadata;
    const res = await postWorkout(incomplete);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("workout_title missing");
    expect(newFiles()).toEqual([]);
    expect(await Video.count()).toBe(0);
  });

  it("requires a file for a new workout", async () => {
    const res = await postWorkout(workoutMetadata, null);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("video missing");
  });
});

describe("workout lifecycle", () => {
  it("creates, lists (with file size), updates the video, and deletes with its file", async () => {
    expect((await postWorkout()).status).toBe(201);
    const [first] = newFiles();

    const list = await api().get("/admin/workouts").set(auth);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    expect(list.body.workoutPlan.Quad[0].video.size).toBe(fs.statSync(first).size);

    const plan = await WorkoutPlan.findOne();
    const update = await api()
      .put("/admin/workoutUpdate")
      .set(auth)
      .field("metadata", JSON.stringify({ id: plan.id, workout_title: "Front Squat", workout_sets: 5 }))
      .attach("file", Buffer.from("a replacement clip"), { filename: "new.mp4", contentType: "video/mp4" });
    expect(update.status).toBe(200);
    await plan.reload();
    expect(plan.workout_title).toBe("Front Squat");
    expect(plan.workout_sets).toBe(5);
    // the old file is gone, exactly one video file remains, and only one Video row
    expect(fs.existsSync(first)).toBe(false);
    expect(newFiles()).toHaveLength(1);
    expect(await Video.count()).toBe(1);

    const del = await api().delete(`/admin/workoutRemove/${plan.id}`).set(auth);
    expect(del.status).toBe(200);
    expect(newFiles()).toEqual([]);
    expect(await WorkoutPlan.count()).toBe(0);
    expect(await Video.count()).toBe(0);
  });

  // Regression: one missing video file made fs.statSync throw and 500 the whole list.
  it("still lists workouts when a video file is missing from disk", async () => {
    await postWorkout();
    for (const file of newFiles()) fs.rmSync(file);

    const admin = await api().get("/admin/workouts").set(auth);
    expect(admin.status).toBe(200);
    expect(admin.body.workoutPlan.Quad[0].video.size).toBe(0);

    await createMember();
    const memberAuth = bearer(await signIn("member", memberCreds));
    const member = await api().get("/member/workoutPlan").set(memberAuth);
    expect(member.status).toBe(200);
    expect(member.body.length).toBe(1);
  });

  it("lists a workout that has no video at all", async () => {
    await WorkoutPlan.create({ ...workoutMetadata, video_id: null });
    const res = await api().get("/admin/workouts").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.workoutPlan.Quad).toHaveLength(1);
  });

  it("404s on updating or deleting an unknown workout and 400s on a bad id", async () => {
    const unknown = "00000000-0000-4000-8000-000000000000";
    const update = await api()
      .put("/admin/workoutUpdate")
      .set(auth)
      .field("metadata", JSON.stringify({ id: unknown }));
    expect(update.status).toBe(404);
    expect((await api().delete(`/admin/workoutRemove/${unknown}`).set(auth)).status).toBe(404);
    expect((await api().delete("/admin/workoutRemove/nope").set(auth)).status).toBe(400);
  });

  it("filters by workout type", async () => {
    await postWorkout();
    await postWorkout({ ...workoutMetadata, workout_title: "Crunch", workout_type: "Abs" });
    const res = await api().get("/admin/workout/Abs").set(auth);
    expect(Object.keys(res.body.workout)).toEqual(["Abs"]);
  });
});

describe("programs", () => {
  it("creates, lists and deletes programs, ignoring extra fields", async () => {
    const created = await api()
      .post("/admin/programs")
      .set(auth)
      .send({ content: "https://example.com/plan", id: "00000000-0000-4000-8000-000000000000" });
    expect(created.status).toBe(200);

    const list = await api().get("/admin/programs").set(auth);
    expect(list.body.programs).toHaveLength(1);
    expect(list.body.programs[0].id).not.toBe("00000000-0000-4000-8000-000000000000");

    expect((await api().post("/admin/programs").set(auth).send({})).status).toBe(400);
    await api().delete(`/admin/programs/${list.body.programs[0].id}`).set(auth).expect(200);
    expect((await api().get("/admin/programs").set(auth)).body.programs).toHaveLength(0);
  });
});
