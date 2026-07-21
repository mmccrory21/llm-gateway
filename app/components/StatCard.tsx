export function StatCard({
  label,
  value,
  sub,
  accent,
  large,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#1f2937] bg-[#121822] px-5 py-4 flex flex-col justify-between min-h-[100px]">
      <span className="text-[11px] uppercase tracking-wider text-[#7c8b9e] font-medium">
        {label}
      </span>
      <span
        className={`font-mono mono font-semibold leading-tight mt-2 ${
          large ? "text-3xl" : "text-2xl"
        }`}
        style={{ color: accent ?? "var(--text)" }}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-[#7c8b9e] mt-1">{sub}</span>}
    </div>
  );
}
