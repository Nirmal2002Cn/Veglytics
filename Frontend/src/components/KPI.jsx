function badgeClass(badge) {
  const b = String(badge || "").toUpperCase();
  if (b === "HIGH" || b === "UP") return "bg-emerald-50 text-emerald-700";
  if (b === "MEDIUM") return "bg-amber-50 text-amber-700";
  if (b === "LOW" || b === "DOWN") return "bg-rose-50 text-rose-700";
  if (b === "STABLE") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

export default function KPI({ title, value, sub, badge }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-600">{title}</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
          {sub ? <div className="mt-1 text-xs text-slate-600">{sub}</div> : null}
        </div>
        {badge ? (
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(badge)}`}>
            {badge}
          </div>
        ) : null}
      </div>
    </div>
  );
}
