"use client";

import { useState } from "react";
import BudgetSummary from "@/components/BudgetSummary";
import BillsTable, { BillInput, Bill } from "@/components/BillsTable";
import AgentLog, { AgentLogEntry } from "@/components/AgentLog";
import { decideBills } from "@/components/AiDecision";

export default function Home() {
  const [dailyLimit, setDailyLimit] = useState<number>(500); // you can change this in the UI
  const [bills, setBills] = useState<Bill[]>([]);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);

  // compute spent and remaining from real bills marked as "paid"
  const spentToday = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  const remaining = Math.max(0, dailyLimit - spentToday);

  const handleAgentDecide = () => {
    if (bills.length === 0) {
      setLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          message: "Agent found no bills to evaluate.",
        },
        ...prev,
      ]);
      return;
    }

    const result = decideBills(bills, remaining);

    // Build quick lookup sets
    const payIds = new Set(result.toPay.map((b) => b.id));
    const deferIds = new Set(result.toDefer.map((b) => b.id));

    // Update bill statuses
    setBills((prev) =>
      prev.map((b) => {
        if (payIds.has(b.id)) {
          return { ...b, status: "paid" };
        }
        if (deferIds.has(b.id)) {
          return { ...b, status: "deferred" };
        }
        // Review bills stay pending - need human confirmation
        return b;
      })
    );

    // Build comprehensive log message
    let logMessage = "Agent allocation run:\n" + result.explanation;

    if (result.comparisonNotes && result.comparisonNotes.length > 0) {
      logMessage += "\n\n📊 Analysis:\n" + result.comparisonNotes.join("\n");
    }

    if (result.toReview.length > 0) {
      logMessage += `\n\n⚠️ ${result.toReview.length} bill(s) require your review before payment.`;
    }

    logMessage += "\n\n(Only pending bills were considered.)";

    setLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        message: logMessage,
      },
      ...prev,
    ]);
  };

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

  const handleAddBill = async (input: BillInput) => {
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

    // Automatically create a prompt to Locus to pay the vendor
    try {
      const prompt = `Please pay ${input.vendor} the amount of $${input.amount.toFixed(2)}. The bill is due on ${input.dueDate}. Category: ${input.category || "General"}.`;
      
      setLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          message: `Sending payment request to Locus for ${input.vendor}...`,
        },
        ...prev,
      ]);

      const response = await fetch("/api/locus-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error || "Failed to send prompt to Locus";
        const details = data.details ? ` (${JSON.stringify(data.details).substring(0, 100)})` : "";
        throw new Error(errorMsg + details);
      }
      
      setLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          message: `✓ Payment request sent to Locus for ${input.vendor} ($${input.amount}).`,
        },
        ...prev,
      ]);
    } catch (error: any) {
      console.error("Error sending prompt to Locus:", error);
      setLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          message: `⚠ Failed to send payment request to Locus for ${input.vendor}: ${error?.message || "Unknown error"}`,
        },
        ...prev,
      ]);
    }
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
      <header className="border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Numa – Agent CFO
          </h1>
          <p className="text-sm text-slate-400">
            Set budgets, add real bills, and track what your agent will manage.
          </p>
        </div>
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
          <div className="flex gap-3">
            <button
              onClick={handleAgentDecide}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
            >
              Run Agent Decision
            </button>
            <div className="text-xs text-slate-400 flex items-center">
              Agent will prioritize: Infrastructure & API costs → SaaS → Workspace → Food
            </div>
          </div>
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
