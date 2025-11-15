"use client";

type BudgetSummaryProps = {
  dailyLimit: number;
  spentToday: number;
  remaining: number;
  onDailyLimitChange: (newLimit: number) => void;
};

export default function BudgetSummary({
  dailyLimit,
  spentToday,
  remaining,
  onDailyLimitChange,
}: BudgetSummaryProps) {
  const percentUsed =
    dailyLimit > 0
      ? Math.min(100, Math.round((spentToday / dailyLimit) * 100))
      : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-slate-300">
            Today&apos;s Budget
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            This limit controls how much your agent is allowed to spend today.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label className="text-xs text-slate-400" htmlFor="daily-limit">
            Daily limit
          </label>
          <input
            id="daily-limit"
            type="number"
            min={0}
            className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
            value={dailyLimit}
            onChange={(e) => onDailyLimitChange(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-3xl font-semibold">
            ${remaining}{" "}
            <span className="text-sm text-slate-400 font-normal">
              remaining of ${dailyLimit}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Spent ${spentToday} so far today (sum of bills marked as paid).
          </p>
        </div>

        <div className="w-full md:w-64">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Usage</span>
            <span>{percentUsed}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

