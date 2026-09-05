const QUICK_OPTION_HOURS: Record<string, number> = {
  "Tomorrow, 10:00 AM": 10,
  "Tomorrow, 11:00 AM": 11,
  "Tomorrow, 3:00 PM": 15,
};

/**
 * Turns a Send Later choice — one of the quick-pick labels, or free text
 * typed into the date field — into a concrete future Date.
 * Falls back to "1 hour from now" if the text can't be parsed, so a
 * schedule attempt never silently fails.
 */
export function resolveSendAt(choice: string): Date {
  const now = new Date();

  if (choice === "Tomorrow") {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }

  const hour = QUICK_OPTION_HOURS[choice];
  if (hour !== undefined) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  const parsed = new Date(choice);
  if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > now.getTime()) {
    return parsed;
  }

  // Unparseable free text — still schedule it rather than losing the choice.
  return new Date(now.getTime() + 60 * 60 * 1000);
}
