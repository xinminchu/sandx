import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERBOT — Sand in, Gold out",
  description:
    "A unified R pipeline for deduplication and record linkage. Nine stages, eleven supervised classifiers, one honest evaluation.",
};

function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-teal-600 text-white grid place-items-center font-bold text-sm">
            ER
          </span>
          <span className="font-bold text-lg tracking-tight">ERBOT</span>
          <span className="hidden sm:inline text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 ml-1">
            sandx.io
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            href="/studio"
            className="px-3 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700"
          >
            Studio
          </Link>
          <Link
            href="/methods"
            className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            Methods
          </Link>
          <Link
            href="/docs"
            className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            Docs
          </Link>
          <a
            href="https://github.com/xinminchu/erbot"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-20">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row gap-6 justify-between text-sm text-slate-500">
        <div>
          <div className="font-bold text-slate-800">ERBOT</div>
          <div className="mt-1">
            Unified entity resolution pipeline for R. MIT licensed.
          </div>
        </div>
        <div className="flex gap-6">
          <Link href="/studio" className="hover:text-teal-700">
            Studio
          </Link>
          <Link href="/methods" className="hover:text-teal-700">
            Methods
          </Link>
          <Link href="/docs" className="hover:text-teal-700">
            Docs
          </Link>
          <a
            href="https://github.com/xinminchu/erbot"
            target="_blank"
            rel="noreferrer"
            className="hover:text-teal-700"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
