"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, RotateCw, Star } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import type { EmailListItem } from "@/lib/data";

function InboxContent() {
  const searchParams = useSearchParams();
  const folder = searchParams.get("folder") ?? "sent";

  const [emails, setEmails] = useState<EmailListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/emails?folder=${folder}`)
      .then((r) => r.json())
      .then((data) => {
        setEmails(data.emails ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [folder]);

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-3.5">
          <div className="flex-1 flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
            <Search className="h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
          <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
            onClick={() => {
              setLoading(true);
              fetch(`/api/emails?folder=${folder}`)
                .then((r) => r.json())
                .then((data) => {
                  setEmails(data.emails ?? []);
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }}
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-neutral-100 px-6 py-3.5 animate-pulse"
                >
                  <div className="h-3 w-28 rounded bg-neutral-100" />
                  <div className="h-5 w-16 rounded bg-neutral-100" />
                  <div className="h-3 flex-1 rounded bg-neutral-100" />
                </div>
              ))}
            </div>
          )}

          {!loading &&
            emails.map((email) => (
              <Link
                key={email.id}
                href={`/inbox/${email.id}`}
                className="flex items-center gap-4 border-b border-neutral-100 px-6 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <span className="w-36 shrink-0 text-sm text-neutral-700 truncate">
                  {email.to}
                </span>

                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                    email.status === "Scheduled"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {email.status === "Scheduled" ? email.statusTime : "Sent"}
                </span>

                <span className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-medium text-neutral-900">
                    {email.subject}
                  </span>
                  <span className="text-neutral-400"> - {email.preview}</span>
                </span>

                <Star className="h-4 w-4 shrink-0 text-neutral-300" />
              </Link>
            ))}

          {!loading && emails.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-neutral-400">
              Nothing here yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={null}>
      <InboxContent />
    </Suspense>
  );
}

