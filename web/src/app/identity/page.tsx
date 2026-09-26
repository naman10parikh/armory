// /identity — the channels Armory answers on. Email, phone, web: one row each, plus the two webhook
// URLs that wire the first two up (setup: docs/CHANNELS.md). The page is called Channels, since
// /c/identity is the Identity harness component (CP138 T51). Server component; addresses come from env so the page states what
// is actually configured rather than what is planned. Tokenised classes only (design/BRIEF.md §6).
import type { Metadata } from "next";
import { ContentWidth, DataTable, Td, Th, Tr } from "@/components/data-table";
import { SITE } from "@/lib/answer";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Channels · Armory",
  description:
    "The channels Armory can answer on: the web today, email and SMS/WhatsApp once configured.",
};

const NOT_CONFIGURED = "Not Configured";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-line bg-raise-1 px-1.5 py-0.5 font-sans text-[12px] text-ink-body">
      {children}
    </code>
  );
}

export default function Identity() {
  const email = process.env.ARMORY_EMAIL ?? "";
  const sms = process.env.TWILIO_PHONE_NUMBER ?? "";
  const whatsapp = process.env.TWILIO_WHATSAPP_NUMBER ?? "";
  const phone = [sms, whatsapp].filter(Boolean).join(" · ");

  return (
    <ContentWidth className="pb-24 pt-8">
      <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">Channels</h1>
      <p className="mt-2 max-w-[64ch] text-[16px] leading-[1.5] text-ink-body">
        Three channels, one ranked catalog search
      </p>

      <section className="mt-8">
        <DataTable label="Channels" minWidthClass="min-w-[640px]">
          <thead>
            <tr>
              <Th className="w-[160px]">Channel</Th>
              <Th className="w-[300px]">Address</Th>
              <Th>What Happens</Th>
            </tr>
          </thead>
          <tbody>
            <Tr>
              <Td className="font-medium text-ink-hi">Email</Td>
              <Td className={email ? "font-sans text-[12px] text-ink-body" : "text-ink-faint"}>
                {email || NOT_CONFIGURED}
              </Td>
              <Td className="text-ink-muted">Subject and body ranked · reply with 5 picks</Td>
            </Tr>
            <Tr>
              <Td className="font-medium text-ink-hi">SMS / WhatsApp</Td>
              <Td className={phone ? "font-sans text-[12px] text-ink-body" : "text-ink-faint"}>
                {phone || NOT_CONFIGURED}
              </Td>
              <Td className="text-ink-muted">Message ranked · reply with 3 picks</Td>
            </Tr>
            <Tr>
              <Td className="font-medium text-ink-hi">Web</Td>
              <Td>
                <a
                  href="/ask"
                  className="cursor-pointer font-sans text-[12px] text-accent-hover underline underline-offset-4"
                >
                  /ask
                </a>
              </Td>
              <Td className="text-ink-muted">Query ranked · 12 picks with signals and install</Td>
            </Tr>
          </tbody>
        </DataTable>
      </section>

      <section className="mt-12">
        <h2 className="text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink-hi">
          Webhook Endpoints
        </h2>
        <ul className="mt-4 flex list-none flex-col gap-2 p-0">
          <li>
            <Code>{`${SITE}/api/inbound/email`}</Code>
          </li>
          <li>
            <Code>{`${SITE}/api/inbound/sms`}</Code>
          </li>
        </ul>
      </section>
    </ContentWidth>
  );
}
