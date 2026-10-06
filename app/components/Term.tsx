import Link from "next/link";
import type { ReactNode } from "react";

/** A term that links to its glossary entry. Dotted underline = "click for definition". */
export default function Term({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Link
      href={`/glossary#${id}`}
      className="underline decoration-dotted decoration-slate-400 underline-offset-2 hover:text-teal-700 hover:decoration-teal-600"
      title="Look up in the glossary"
    >
      {children}
    </Link>
  );
}
