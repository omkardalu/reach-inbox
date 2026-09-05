// --- Types ------------------------------------------------------------------

export type Folder = "scheduled" | "sent";

export type EmailListItem = {
  id: string;
  to: string;
  status: "Scheduled" | "Sent";
  statusTime?: string;
  subject: string;
  preview: string;
  starred?: boolean;
};

export type Attachment = {
  name: string;
  size: string;
  thumb: string;
};

export type ThreadDetail = {
  id: string;
  refCode: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  senderInitial: string;
  date: string;
  bodyLines: string[];
  calloutTitle: string;
  calloutSub: string;
  signatureName: string;
  psLine: string;
  attachments: Attachment[];
};

export type NewEmailInput = {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  sendAt?: string;
};

// --- Helpers -----------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateRefCode(): string {
  const part = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${part()} ${part()}`;
}

function rowToListItem(row: {
  id: string;
  toAddress: string;
  status: string;
  statusTime: string | null;
  subject: string;
  preview: string;
}): EmailListItem {
  return {
    id: row.id,
    to: row.toAddress,
    status: row.status as "Scheduled" | "Sent",
    statusTime: row.statusTime ?? undefined,
    subject: row.subject,
    preview: row.preview,
  };
}

function rowToThread(row: {
  id: string;
  refCode: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  body: string;
  status: string;
  statusTime: string | null;
  createdAt: Date;
}): ThreadDetail {
  const isScheduled = row.status === "Scheduled";
  const dateLabel = isScheduled
    ? `Scheduled for ${row.statusTime}`
    : row.createdAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

  return {
    id: row.id,
    refCode: row.refCode,
    subject: row.subject,
    senderName: row.fromName,
    senderEmail: row.fromEmail,
    senderInitial: row.fromName.charAt(0).toUpperCase(),
    date: dateLabel,
    bodyLines: row.body.split("\n").filter(Boolean),
    calloutTitle: "",
    calloutSub: "",
    signatureName: row.fromName,
    psLine: "",
    attachments: [],
  };
}

// --- Public async helpers ----------------------------------------------------

export async function getEmails(
  userEmail: string,
  folder: Folder
): Promise<EmailListItem[]> {
  const { db } = await import("@/lib/db");
  const { emails } = await import("@/lib/db/schema");
  const { eq, and, isNull, isNotNull, desc } = await import("drizzle-orm");

  const statusVal = folder === "scheduled" ? "Scheduled" : "Sent";

  const rows = await db
    .select()
    .from(emails)
    .where(
      and(
        eq(emails.userEmail, userEmail),
        eq(emails.status, statusVal),
        folder === "scheduled" ? isNotNull(emails.sendAt) : isNull(emails.sendAt)
      )
    )
    .orderBy(desc(emails.createdAt));

  return rows.map(rowToListItem);
}

export async function getThread(
  userEmail: string,
  id: string
): Promise<ThreadDetail | null> {
  const { db } = await import("@/lib/db");
  const { emails } = await import("@/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const rows = await db
    .select()
    .from(emails)
    .where(and(eq(emails.id, id), eq(emails.userEmail, userEmail)))
    .limit(1);

  if (rows.length === 0) return null;
  return rowToThread(rows[0]);
}

export async function addEmail(
  userEmail: string,
  input: NewEmailInput
): Promise<EmailListItem> {
  const { db } = await import("@/lib/db");
  const { emails } = await import("@/lib/db/schema");

  const id = generateId();
  const isScheduled = !!input.sendAt;

  const statusTime = isScheduled
    ? new Date(input.sendAt!).toLocaleString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const preview = input.body.slice(0, 80);
  const subject = input.subject || "(no subject)";

  await db.insert(emails).values({
    id,
    userEmail,
    refCode: generateRefCode(),
    toAddress: `To: ${input.to}`,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
    subject,
    body: input.body,
    preview,
    status: isScheduled ? "Scheduled" : "Sent",
    statusTime,
    sendAt: input.sendAt ? new Date(input.sendAt) : null,
  });

  return {
    id,
    to: `To: ${input.to}`,
    status: isScheduled ? "Scheduled" : "Sent",
    statusTime: statusTime ?? undefined,
    subject,
    preview,
  };
}
