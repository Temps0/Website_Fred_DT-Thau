import { createHash, randomBytes } from 'node:crypto';

/**
 * Spam protection for public forms, without CAPTCHA or third-party service:
 * a honeypot field, a minimum fill-in time and rate limits.
 */

/** Name of the hidden field that people never fill in, but naive bots do. */
export const HONEYPOT_FIELD = 'website';
/** Name of the hidden field holding the time the form was first rendered (ms since epoch). */
export const STARTED_AT_FIELD = 'started';

const MIN_FILL_TIME_MS = 3_000;
const MAX_CLOCK_SKEW_MS = 60_000;

/** Reads the render time posted back by the form, or null when it is missing or forged. */
export function readStartedAt(form: FormData, now = Date.now()): number | null {
  const raw = form.get(STARTED_AT_FIELD);
  if (typeof raw !== 'string' || !/^\d{13}$/.test(raw)) return null;
  const startedAt = Number(raw);
  return startedAt > now + MAX_CLOCK_SKEW_MS ? null : startedAt;
}

/**
 * - 'honeypot': a bot filled the hidden field; answer with a fake success.
 * - 'too-fast': sent faster than a person can, or without a valid render time; show the
 *   form again with a message, since it may be a person who was quick.
 * - 'ok': nothing suspicious.
 */
export function spamCheck(form: FormData, now = Date.now()): 'honeypot' | 'too-fast' | 'ok' {
  const honeypot = form.get(HONEYPOT_FIELD);
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return 'honeypot';
  const startedAt = readStartedAt(form, now);
  return startedAt === null || now - startedAt < MIN_FILL_TIME_MS ? 'too-fast' : 'ok';
}

/**
 * Rate limiting key of a client: the IPv4 address, or the /64 prefix of an IPv6 address
 * (a single subscriber usually owns a whole /64).
 */
export function clientKey(address: string): string {
  const ip = address.replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/i, '').replace(/%.*$/, '');
  if (!ip.includes(':')) return ip;
  const [head = '', tail = ''] = ip.split('::');
  const headParts = head ? head.split(':') : [];
  const tailParts = tail ? tail.split(':') : [];
  const zeros = Array(Math.max(8 - headParts.length - tailParts.length, 0)).fill('0');
  const groups = [...headParts, ...zeros, ...tailParts];
  return `${groups
    .slice(0, 4)
    .map((group) => group.toLowerCase().padStart(4, '0'))
    .join(':')}::/64`;
}

interface Window {
  limit: number;
  windowMs: number;
}

/** Outcome of a limit check: allowed, or refused by the per-visitor or the global limit. */
export type LimitResult = 'ok' | 'client' | 'global';

/**
 * Limits stored submissions per client and for everybody (so that a flood from many
 * addresses cannot fill the shared disk). State lives in memory only; client keys are
 * hashed with a random per-process salt, and expired entries are swept every minute, so
 * no address is kept longer than the window plus one minute.
 */
export function createSubmissionLimiter(perClient: Window, global: Window) {
  const salt = randomBytes(16);
  const hits = new Map<string, number[]>();
  const globalHits: number[] = [];

  const recent = (timestamps: number[], windowMs: number, now: number) =>
    timestamps.filter((time) => now - time < windowMs);

  const sweep = (now = Date.now()) => {
    for (const [key, timestamps] of hits) {
      const kept = recent(timestamps, perClient.windowMs, now);
      if (kept.length === 0) hits.delete(key);
      else hits.set(key, kept);
    }
    globalHits.splice(0, globalHits.length, ...recent(globalHits, global.windowMs, now));
  };
  // unref: the timer must not keep the process alive on shutdown.
  setInterval(sweep, 60_000).unref();

  /**
   * 'ok' when the submission is allowed (it is then counted); otherwise which limit was
   * reached, so that the visitor can be told how long to wait.
   */
  return function checkSubmission(address: string, now = Date.now()): LimitResult {
    const key = createHash('sha256').update(salt).update(clientKey(address)).digest('hex');
    const clientHits = recent(hits.get(key) ?? [], perClient.windowMs, now);
    const everybody = recent(globalHits, global.windowMs, now);
    if (clientHits.length >= perClient.limit) return 'client';
    if (everybody.length >= global.limit) return 'global';
    hits.set(key, [...clientHits, now]);
    globalHits.splice(0, globalHits.length, ...everybody, now);
    return 'ok';
  };
}
