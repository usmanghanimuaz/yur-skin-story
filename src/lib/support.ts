/** Rules for the in-app support desk. Kept browser-safe so they can be tested and reused on both sides. */

export const SUPPORT_SUBJECT_MAX = 120;
export const SUPPORT_BODY_MIN = 10;
export const SUPPORT_BODY_MAX = 4000;
/** A person may keep only this many unanswered threads open at once. */
export const MAX_OPEN_SUPPORT_THREADS = 3;
export const OPEN_STATUSES = ["open", "replied"] as const;

export type SupportDraft = { subject: string; body: string };
export type SupportLike = { status: string };

/** The first thing wrong with a draft message, or null when it can be sent. */
export function supportDraftError(draft: SupportDraft): string | null {
  const subject = draft.subject.trim();
  const body = draft.body.trim();
  if (!subject) return "Add a short subject so we know what this is about.";
  if (subject.length > SUPPORT_SUBJECT_MAX) return `Keep the subject under ${SUPPORT_SUBJECT_MAX} characters.`;
  if (body.length < SUPPORT_BODY_MIN) return `Tell us a little more — at least ${SUPPORT_BODY_MIN} characters.`;
  if (body.length > SUPPORT_BODY_MAX) return `Keep the message under ${SUPPORT_BODY_MAX} characters.`;
  return null;
}

/** True when this person may still send a new message. */
export function canStartSupportThread(messages: SupportLike[]): boolean {
  return messages.filter((m) => (OPEN_STATUSES as readonly string[]).includes(m.status)).length < MAX_OPEN_SUPPORT_THREADS;
}

/** Whether a reply is still expected from us. */
export function supportAwaitingReply(messages: SupportLike[]): boolean {
  return messages.some((m) => m.status === "open");
}
