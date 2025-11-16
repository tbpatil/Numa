"use client";

import { useState } from "react";
import BudgetSummary from "@/components/BudgetSummary";
import BillsTable, { BillInput, Bill } from "@/components/BillsTable";
import AgentLog, { AgentLogEntry } from "@/components/AgentLog";

export default function Dashboard() {
  const [dailyLimit, setDailyLimit] = useState<number>(500); // you can change this in the UI
  const [bills, setBills] = useState<Bill[]>([]);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);

  // compute spent and remaining from real bills marked as "paid"
  const spentToday = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  const remaining = Math.max(0, dailyLimit - spentToday);

  const handleBudgetChange = (newLimit: number) => {
    setDailyLimit(newLimit);
    setLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        message: `Updated daily budget to $${newLimit}.`,
      },
      ...prev,
    ]);
  };

  const handleAddBill = (input: BillInput) => {
    const id = crypto.randomUUID();
    const newBill: Bill = {
      id,
      vendor: input.vendor,
      category: input.category,
      amount: input.amount,
      dueDate: input.dueDate,
      status: "pending",
      receiptUrl: input.receiptUrl,
      receiptName: input.receiptName,
    };

    setBills((prev) => [newBill, ...prev]);
    setLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        message: `Created bill for ${input.vendor} ($${input.amount}) due on ${input.dueDate}.`,
      },
      ...prev,
    ]);
  };

  const handleMarkPaid = (billId: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, status: "paid" } : b
      )
    );

    const bill = bills.find((b) => b.id === billId);
    setLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        message: bill
          ? `Marked ${bill.vendor} bill for $${bill.amount} as PAID.`
          : `Marked bill ${billId} as PAID.`,
      },
      ...prev,
    ]);
  };

  const handleMarkDeferred = (billId: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, status: "deferred" } : b
      )
    );

    const bill = bills.find((b) => b.id === billId);
    setLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        message: bill
          ? `Deferred ${bill.vendor} bill for $${bill.amount}.`
          : `Deferred bill ${billId}.`,
      },
      ...prev,
    ]);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top navbar */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Numa – Agent CFO
          </h1>
          <p className="text-sm text-slate-400">
            Set budgets, add real bills, and track what your agent will manage.
          </p>
        </div>
        <button
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
          onClick={() => {
            setLogs((prev) => [
              {
                time: new Date().toLocaleTimeString(),
                message:
                  "Run Agent clicked. (Next step: connect this to Claude + Locus to make real payment decisions.)",
              },
              ...prev,
            ]);
          }}
        >
          Run Agent
        </button>
      </header>

      {/* Content grid */}
      <section className="px-6 py-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <BudgetSummary
            dailyLimit={dailyLimit}
            spentToday={spentToday}
            remaining={remaining}
            onDailyLimitChange={handleBudgetChange}
          />
          <BillsTable
            bills={bills}
            onAddBill={handleAddBill}
            onMarkPaid={handleMarkPaid}
            onMarkDeferred={handleMarkDeferred}
          />
        </div>

        <div className="space-y-4">
          <AgentLog logs={logs} />
        </div>
      </section>
    </main>
  );
}

