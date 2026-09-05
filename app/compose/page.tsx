"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Paperclip,
  History,
  ChevronDown,
  Undo2,
  Redo2,
  CaseSensitive,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Strikethrough,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SendLaterPopover from "@/components/SendLaterPopover";
import { useSession } from "next-auth/react";
import { resolveSendAt } from "@/lib/sendLater";

const toolbarGroups: { icon: typeof Bold; label: string }[][] = [
  [
    { icon: Undo2, label: "Undo" },
    { icon: Redo2, label: "Redo" },
  ],
  [{ icon: CaseSensitive, label: "Font size" }],
  [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Underline, label: "Underline" },
  ],
  [{ icon: AlignLeft, label: "Align" }],
  [
    { icon: List, label: "Bulleted list" },
    { icon: ListOrdered, label: "Numbered list" },
    { icon: Outdent, label: "Outdent" },
    { icon: Indent, label: "Indent" },
  ],
  [
    { icon: Quote, label: "Quote" },
    { icon: Strikethrough, label: "Strikethrough" },
  ],
];

export default function ComposePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [showSendLater, setShowSendLater] = useState(false);
  const [sendLaterChoice, setSendLaterChoice] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentToast, setSentToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fromEmail = session?.user?.email ?? "";

  async function postEmail(sendAt?: string, scheduledLabel?: string) {
    // Include anything still sitting in the input box, in case the user
    // typed a recipient but never pressed Enter/comma to chip it.
    const pending = recipientInput.trim();
    const allRecipients =
      pending && !recipients.includes(pending) ? [...recipients, pending] : recipients;
    const to = allRecipients.join(", ");

    if (!to) {
      setErrorToast("Add at least one recipient");
      return;
    }

    setSending(true);
    setErrorToast(null);
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body, sendAt }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        if (pending) {
          setRecipients(allRecipients);
          setRecipientInput("");
        }
        const label = sendAt ? `Scheduled for ${scheduledLabel}` : "Email sent";
        setSentToast(label);
        setTimeout(() => {
          setSentToast(null);
          router.push("/inbox?folder=" + (sendAt ? "scheduled" : "sent"));
        }, 1500);
      } else {
        setErrorToast(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setErrorToast("Network error — check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  function handleDone(choice: string) {
    setSendLaterChoice(choice || null);
    setShowSendLater(false);
    if (choice) {
      const sendAt = resolveSendAt(choice).toISOString();
      postEmail(sendAt, choice);
    }
  }

  function handleSend() {
    postEmail();
  }

  function handleRecipientKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && recipientInput.trim()) {
      e.preventDefault();
      setRecipients((prev) => [...prev, recipientInput.trim()]);
      setRecipientInput("");
    }
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3.5">
          <Link
            href="/inbox"
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <h1 className="flex-1 text-sm font-medium">Compose New Email</h1>

          <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
            <Paperclip className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
            <History className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSendLater((v) => !v)}
              className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              {sendLaterChoice ? sendLaterChoice : "Send Later"}
            </button>
            {showSendLater && (
              <SendLaterPopover
                onClose={() => setShowSendLater(false)}
                onDone={handleDone}
              />
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="rounded-full bg-emerald-500 px-5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-5">
          <div className="border-b border-neutral-100 py-3 flex items-center gap-4">
            <span className="w-16 shrink-0 text-sm text-neutral-400">From</span>
            <button className="flex items-center gap-1 text-sm text-neutral-800">
              {fromEmail || "…"}
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          </div>

          <div className="border-b border-neutral-100 py-3 flex items-center gap-4">
            <span className="w-16 shrink-0 text-sm text-neutral-400">To</span>
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {recipients.map((r) => (
                <span
                  key={r}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
                >
                  {r}
                  <X
                    className="h-3 w-3 cursor-pointer text-neutral-400"
                    onClick={() => setRecipients((prev) => prev.filter((x) => x !== r))}
                  />
                </span>
              ))}
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={handleRecipientKeyDown}
                placeholder="recipient@example.com, press Enter"
                className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
            <button className="shrink-0 flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Upload List
            </button>
          </div>

          <div className="border-b border-neutral-100 py-3 flex items-center gap-4">
            <span className="w-16 shrink-0 text-sm text-neutral-400">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <div className="flex items-center gap-8 border-b border-neutral-100 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-400">
                Delay between 2 emails
              </span>
              <input
                type="text"
                defaultValue="00"
                className="w-12 rounded-md border border-neutral-200 px-2 py-1 text-center text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-400">Hourly Limit</span>
              <input
                type="text"
                defaultValue="00"
                className="w-12 rounded-md border border-neutral-200 px-2 py-1 text-center text-sm outline-none"
              />
            </div>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type Your Reply..."
            className="mt-4 h-56 w-full resize-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />



          <div className="flex flex-wrap items-center gap-1 border-t border-neutral-100 pt-3">
            {toolbarGroups.map((group, gi) => (
              <div key={gi} className="flex items-center gap-0.5 pr-2 mr-2 border-r border-neutral-100 last:border-r-0">
                {group.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    title={label}
                    className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      {sentToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">
          {sentToast}
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {errorToast}
        </div>
      )}
    </div>
  );
}
