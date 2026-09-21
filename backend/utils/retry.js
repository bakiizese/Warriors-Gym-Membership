const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs `fn` until it succeeds, waiting between attempts, and rethrows the last
// error once the attempts run out. Used for the first database connection:
// hosted Postgres (Neon scales to zero) can take a few seconds to wake up, and
// on hosts that start services in any order the database may not be there yet.
export async function retry(fn, { attempts = 10, delayMs = 3000, onRetry } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= attempts) throw err;
      onRetry?.(err, attempt, attempts);
      await sleep(delayMs);
    }
  }
}
