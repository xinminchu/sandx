"use client";

import { useEffect, useState } from "react";
import { getTerm } from "./glossary-data";

/**
 * A term that shows its definition in a modal. Dotted underline = "click for
 * definition". The modal keeps the user on the page — no navigation, no lost
 * state. Safe to nest inside buttons (clicks don't bubble).
 */
export default function Term({ id, children }: { id: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = getTerm(id);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  const show = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={show}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            show(e);
          }
        }}
        className="underline decoration-dotted decoration-slate-400 underline-offset-2 cursor-pointer hover:text-teal-700 hover:decoration-teal-600"
        title="Click for definition"
      >
        {children}
      </span>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-xl max-w-sm w-full p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline gap-2 flex-wrap">
              <code className="font-mono text-[15px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                {entry?.term ?? id}
              </code>
              {entry?.aka && <span className="text-sm text-slate-500">{entry.aka}</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {entry?.body ?? "Definition not found."}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <a
                href={`/glossary#${id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-teal-700 underline decoration-dotted underline-offset-2"
              >
                Full glossary →
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
