"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Clock, Send } from "lucide-react";
import { useSession } from "next-auth/react";

function FolderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolder = searchParams.get("folder") ?? "sent";
  const onInbox = pathname === "/inbox";

  const [counts, setCounts] = useState({ scheduled: 0, sent: 0 });

  useEffect(() => {
    async function fetchCounts() {
      const [schRes, sentRes] = await Promise.all([
        fetch("/api/emails?folder=scheduled"),
        fetch("/api/emails?folder=sent"),
      ]);
      if (schRes.ok && sentRes.ok) {
        const [schData, sentData] = await Promise.all([schRes.json(), sentRes.json()]);
        setCounts({ scheduled: schData.count, sent: sentData.count });
      }
    }
    fetchCounts();
  }, [pathname, searchParams]);

  return (
    <nav className="px-3 flex flex-col gap-1">
      <Link
        href="/inbox?folder=scheduled"
        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
          onInbox && activeFolder === "scheduled"
            ? "bg-emerald-50 text-emerald-700 font-medium"
            : "text-neutral-700 hover:bg-neutral-50"
        }`}
      >
        <Clock className="h-4 w-4" />
        <span className="flex-1">Scheduled</span>
        <span className="text-xs text-neutral-400">{counts.scheduled}</span>
      </Link>
      <Link
        href="/inbox?folder=sent"
        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
          onInbox && activeFolder === "sent"
            ? "bg-emerald-50 text-emerald-700 font-medium"
            : "text-neutral-700 hover:bg-neutral-50"
        }`}
      >
        <Send className="h-4 w-4" />
        <span className="flex-1">Sent</span>
        <span className="text-xs text-neutral-400">{counts.sent}</span>
      </Link>
    </nav>
  );
}

export default function Sidebar() {
  const { data: session } = useSession();

  const name = session?.user?.name ?? "…";
  const email = session?.user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside className="w-[260px] shrink-0 border-r border-neutral-200 flex flex-col h-full bg-white">
      <div className="px-5 pt-6 pb-4">
        <span className="text-xl font-extrabold tracking-tight">ONB</span>
      </div>

      <div className="px-5 pb-4">
        <button className="w-full flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50 transition-colors">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            {initial}
          </span>
          <span className="flex-1 text-left min-w-0">
            <span className="block text-sm font-medium text-neutral-900 truncate">
              {name}
            </span>
            <span className="block text-xs text-neutral-500 truncate">
              {email}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
        </button>
      </div>

      <div className="px-5 pb-5">
        <Link
          href="/compose"
          className="flex w-full items-center justify-center rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
        >
          Compose
        </Link>
      </div>

      <div className="px-5 pb-2 text-[11px] font-semibold tracking-wide text-neutral-400">
        CORE
      </div>

      <Suspense fallback={null}>
        <FolderNav />
      </Suspense>
    </aside>
  );
}

