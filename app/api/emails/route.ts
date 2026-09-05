import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEmails, addEmail, type Folder } from "@/lib/data";
import { sendMail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folder = (request.nextUrl.searchParams.get("folder") ?? "sent") as Folder;
  const emails = await getEmails(session.user.email, folder);
  return NextResponse.json({ emails, count: emails.length });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { to, subject, body: emailBody, sendAt } = body;

  if (!to) {
    return NextResponse.json({ error: "Missing required field: to" }, { status: 400 });
  }

  const recipients = String(to)
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No valid recipients" }, { status: 400 });
  }

  const isScheduled = !!sendAt;

  // Immediate sends go out over SMTP right now, to every recipient.
  // Scheduled sends are only persisted here — actual dispatch at the
  // chosen time still needs a background worker (not built yet).
  if (!isScheduled) {
    try {
      await sendMail({
        to: recipients.join(", "),
        subject: subject ?? "",
        text: emailBody ?? "",
        fromName: session.user.name ?? undefined,
        replyTo: session.user.email,
      });
    } catch (err) {
      console.error("Failed to send email:", err);
      const message = err instanceof Error ? err.message : "Failed to send email";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const email = await addEmail(session.user.email, {
    fromName: session.user.name ?? session.user.email,
    fromEmail: session.user.email,
    to: recipients.join(", "),
    subject: subject ?? "",
    body: emailBody ?? "",
    sendAt,
  });

  return NextResponse.json({ email }, { status: 201 });
}
