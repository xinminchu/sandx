import type { Metadata } from "next";
import LibraryClient from "./LibraryClient";

export const metadata: Metadata = {
  title: "Literature Library — ERBOT",
  description:
    "A working library of entity resolution and record linkage research: theme blocks, multi-angle search, direct access by paper number, and a Borrow / Fill / Correct reading of every entry.",
};

export default function Library() {
  return <LibraryClient />;
}
