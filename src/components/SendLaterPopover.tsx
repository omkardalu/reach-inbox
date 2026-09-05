"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

const quickOptions = [
  "Tomorrow",
  "Tomorrow, 10:00 AM",
  "Tomorrow, 11:00 AM",
  "Tomorrow, 3:00 PM",
];

export default function SendLaterPopover({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (choice: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pickedDate, setPickedDate] = useState("");

  return (
    <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
      <p className="mb-3 text-sm font-semibold text-neutral-900">Send Later</p>

      <div className="mb-3 flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
        <input
          type="text"
          value={pickedDate}
          onChange={(e) => {
            setPickedDate(e.target.value);
            setSelected(null);
          }}
          placeholder="Pick date & time"
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
        <Calendar className="h-4 w-4 shrink-0 text-neutral-400" />
      </div>

      <div className="mb-4 flex flex-col gap-1">
        {quickOptions.map((option) => (
          <button
            key={option}
            onClick={() => {
              setSelected(option);
              setPickedDate("");
            }}
            className={`rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
              selected === option
                ? "bg-emerald-50 text-emerald-700 font-medium"
                : "text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onDone(selected ?? pickedDate)}
          className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Done
        </button>
      </div>
    </div>
  );
}
