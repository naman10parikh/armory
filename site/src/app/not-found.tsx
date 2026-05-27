import Link from "next/link";
import { Logo } from "@/components/logo";
import { MagneticCta } from "@/components/magnetic-cta";
import { ArrowRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <Logo size={40} />
      <h1 className="mt-6 font-serif text-[clamp(2.5rem,6vw,4rem)] leading-none tracking-[-0.02em] text-ink-hi">
        No engram here.
      </h1>
      <p className="mt-4 max-w-md text-ink-muted">
        This memory isn&apos;t in the brain — or hasn&apos;t been formed yet.
      </p>
      <div className="mt-8">
        <MagneticCta
          href="/browse"
          icon={<ArrowRightIcon size={15} className="text-base" />}
        >
          Browse the brain
        </MagneticCta>
      </div>
    </div>
  );
}
