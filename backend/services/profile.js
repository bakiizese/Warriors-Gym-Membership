import { isDemoLocked } from "../config/demo.js";
import { HttpError } from "../middleware/errors.js";
import { gen_jwt_token } from "../utils/jwt.js";
import { hash_password, verify_password } from "../utils/password.js";
import { removeUpload } from "./files.js";

const MIN_PASSWORD_LENGTH = 6;

// Fields a profile edit may change. Anything else in the payload is ignored,
// which is what stops a client from rewriting ids, status or admin level.
const EDITABLE = {
  admin: ["full_name", "language"],
  member: ["full_name", "gender", "height", "weight", "age", "language"],
};
const NUMERIC = ["height", "weight", "age"];

export function withoutPassword(instance) {
  const { password: _password, ...rest } = instance.toJSON();
  return rest;
}

/**
 * Applies a profile edit to a loaded admin or member.
 *
 * `selfService` is true when users edit their own account: only then may they
 * change their password (which needs the old one), and only then is a fresh
 * token returned after a phone-number change, because the token embeds it.
 *
 * `user` must be loaded with the "withPassword" scope when selfService is true.
 * Returns `{ token }` (or `{}`).
 */
export async function updateProfile({
  Model,
  role,
  user,
  updateData,
  filePath,
  selfService,
}) {
  const changesLogin =
    updateData.oldPassword ||
    (updateData.phone_number && updateData.phone_number !== user.phone_number);
  if (changesLogin && isDemoLocked(user)) {
    throw new HttpError(403, "this demo account's login cannot be changed");
  }

  for (const key of EDITABLE[role]) {
    const value = updateData[key];
    if (value === undefined || value === "") continue;
    if (NUMERIC.includes(key) && !Number.isFinite(Number(value))) {
      throw new HttpError(400, `${key} must be a number`);
    }
    user[key] = value;
  }

  if (selfService && updateData.oldPassword) {
    const correct = await verify_password(
      String(updateData.oldPassword),
      user.password,
    );
    if (!correct) {
      throw new HttpError(400, "incorrect oldPassword");
    }
    const next = String(updateData.password ?? "");
    if (next.length < MIN_PASSWORD_LENGTH) {
      throw new HttpError(
        400,
        `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    }
    user.password = await hash_password(next);
  }

  let token;
  const newPhone = updateData.phone_number;
  if (newPhone && newPhone !== user.phone_number) {
    const taken = await Model.findOne({ where: { phone_number: newPhone } });
    if (taken) {
      throw new HttpError(400, "phone number exists");
    }
    user.phone_number = newPhone;
    if (selfService) {
      token = gen_jwt_token({
        id: user.id,
        phone_number: newPhone,
        role,
      });
    }
  }

  const previousImage = user.image;
  if (filePath) {
    user.image = filePath;
  }
  await user.save();
  // Remove the old file only once the row points at the new one.
  if (filePath && previousImage) {
    await removeUpload(previousImage);
  }

  return token ? { token } : {};
}
