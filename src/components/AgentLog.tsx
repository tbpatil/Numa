"use client";

export type AgentLogEntry = {
  time: string;
  message: string;
};

type AgentLogProps = {
  logs: AgentLogEntry[];
};

export default function AgentLog({ logs }: AgentLogProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 h-full">
      <h2 className="text-sm font-medium text-slate-300">Activity</h2>
      <p className="text-xs text-slate-500 mt-1">
        All real actions (budget changes, new bills, status updates, agent runs).
      </p>

      <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {logs.length === 0 && (
          <div className="text-xs text-slate-500">
            No activity yet. Update the budget or add a bill to see entries.
          </div>
        )}
        {logs.map((log, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
          >
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              {log.time}
            </div>
            <div className="text-xs text-slate-200 leading-relaxed">
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

