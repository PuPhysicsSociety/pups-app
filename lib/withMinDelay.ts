/**
 * Wraps a promise so it never resolves *or rejects* faster than `ms` —
 * used to keep a loading indicator (the pendulum, skeletons) on screen
 * long enough to actually be seen, instead of flashing for a few
 * milliseconds on a fast connection or localhost. Doesn't slow down
 * genuinely slow requests; it only adds a floor, never a ceiling.
 *
 * Deliberately NOT `Promise.all([promise, delay])` — Promise.all rejects
 * the instant either input rejects, so an error path would skip the
 * delay entirely regardless of how large `ms` is. Both branches below
 * wait out the delay before settling, so a fast failure is just as
 * visible as a fast success.
 */
export function withMinDelay<T>(promise: Promise<T>, ms = 500): Promise<T> {
  const delay = new Promise<void>(resolve => setTimeout(resolve, ms));
  return promise.then(
    async (result) => { await delay; return result; },
    async (err) => { await delay; throw err; }
  );
}
