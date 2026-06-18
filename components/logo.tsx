import Link from "next/link";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="Ledger AI home">
      <span className="ledger-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.03em] text-ink">Ledger AI</span>}
    </Link>
  );
}
