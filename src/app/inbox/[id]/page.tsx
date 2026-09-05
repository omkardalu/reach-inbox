import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/auth";
import { getThread } from "@/lib/data";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const { id } = await params;
  const thread = await getThread(session.user.email, id);
  if (!thread) notFound();

  const userInitial = (session.user.name ?? session.user.email)
    .charAt(0)
    .toUpperCase();

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
          <h1 className="flex-1 min-w-0 truncate text-sm font-medium">
            {thread.subject}{" "}
            <span className="text-neutral-400 font-normal">
              | {thread.refCode}
            </span>
          </h1>
          <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
            <Star className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
            <Archive className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
            <Trash2 className="h-4 w-4" />
          </button>
          <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
            {userInitial}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {thread.senderInitial}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm">
                  <span className="font-semibold text-neutral-900">
                    {thread.senderName}
                  </span>{" "}
                  <span className="text-neutral-400">
                    &lt;{thread.senderEmail}&gt;
                  </span>
                </p>
                <span className="shrink-0 text-xs text-neutral-400">
                  {thread.date}
                </span>
              </div>
              <p className="flex items-center gap-1 text-xs text-neutral-400">
                to me <ChevronDown className="h-3 w-3" />
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-800">
            {thread.bodyLines.length > 0 ? (
              thread.bodyLines.map((line, i) => <p key={i}>{line}</p>)
            ) : (
              <p className="text-neutral-400">(no body)</p>
            )}

            {thread.calloutTitle && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="font-semibold text-neutral-900">
                  ⚡ {thread.calloutTitle} ⚡
                </p>
                <p className="mt-1 text-neutral-700">{thread.calloutSub}</p>
              </div>
            )}

            {thread.signatureName.split("\n").map((line, i) => (
              <p key={i}>{line || "\u00A0"}</p>
            ))}

            {thread.psLine && (
              <p className="text-neutral-500">{thread.psLine}</p>
            )}
          </div>

          {thread.attachments.length > 0 && (
            <div className="mt-6 flex gap-3">
              {thread.attachments.map((att) => (
                <div
                  key={att.name}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 p-2 pr-4"
                >
                  <div className="text-xs">
                    <p className="font-medium text-neutral-800">{att.name}</p>
                    <p className="text-neutral-400">{att.size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

