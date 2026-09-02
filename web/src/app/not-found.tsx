import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowRightIcon } from "@/components/icons";

// The only in-app trigger for this route is `notFound()` in
// app/e/[type]/[slug]/page.tsx — COPY.md §4F.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-5 text-center">
      <Logo size={32} />
      <h1 className="mt-5 text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">
        Not Found
      </h1>
      <p className="mt-3 text-[14px] text-ink-muted">No component matches this address</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/browse"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent-line bg-accent-quiet px-4 py-2 text-[13px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:bg-accent-line"
        >
          Browse
          <ArrowRightIcon size={13} />
        </Link>
        <a
          href="https://github.com/naman10parikh/component/issues/new"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex cursor-pointer items-center rounded-lg border border-line px-4 py-2 text-[13px] font-medium text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover"
        >
          Report
        </a>
      </div>
    </div>
  );
}
