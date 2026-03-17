import bcrypt from "bcrypt";

export async function hash_password(password) {
  const hashed_password = await bcrypt.hash(password, 10);

  return hashed_password;
}

export async function verify_password(password, hashed_password) {
  const verify = await bcrypt.compare(password, hashed_password);
  if (verify) {
    return true;
  }
  return false;
}
