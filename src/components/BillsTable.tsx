"use client";

import { FormEvent, useState } from "react";
import { getVendorLogoFromText } from "@/components/vendorLogo";

export type BillStatus = "pending" | "paid" | "deferred";

export type Bill = {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  category: string;
  receiptUrl?: string;
  receiptName?: string;
};

export type BillInput = {
  vendor: string;
  amount: number;
  dueDate: string;
  category: string;
  receiptUrl?: string;
  receiptName?: string;
};

type BillsTableProps = {
  bills: Bill[];
  onAddBill: (input: BillInput) => void;
  onMarkPaid: (billId: string) => void;
  onMarkDeferred: (billId: string) => void;
};

function statusBadge(status: BillStatus) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (status) {
    case "paid":
      return `${base} bg-emerald-500/15 text-emerald-300 border border-emerald-500/30`;
    case "pending":
      return `${base} bg-amber-500/15 text-amber-300 border border-amber-500/30`;
    case "deferred":
      return `${base} bg-slate-500/15 text-slate-300 border border-slate-500/30`;
  }
}

export default function BillsTable({
  bills,
  onAddBill,
  onMarkPaid,
  onMarkDeferred,
}: BillsTableProps) {
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!vendor || !amount || !dueDate) return;

    let receiptUrl: string | undefined;
    let receiptName: string | undefined;

    if (receiptFile) {
      receiptUrl = URL.createObjectURL(receiptFile);
      receiptName = receiptFile.name;
    }

    onAddBill({
      vendor,
      category: category || "General",
      amount: typeof amount === "number" ? amount : Number(amount),
      dueDate,
      receiptUrl,
      receiptName,
    });

    // reset form
    setVendor("");
    setCategory("");
    setAmount("");
    setDueDate("");
    setReceiptFile(null);
    setParseError(null);
  };

  const handleReceiptChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;
    setReceiptFile(file);
    setParseError(null);

    if (!file) return;

    try {
      setIsParsing(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-receipt", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Failed to parse receipt";
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
          if (data.raw) {
            errorMessage += ` (Response: ${data.raw})`;
          }
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: {
        vendor: string;
        amount: number;
        dueDate: string;
        category: string;
      } = await res.json();

      if (data.vendor) setVendor(data.vendor);
      if (data.category) setCategory(data.category);
      if (data.amount) setAmount(data.amount);
      if (data.dueDate) setDueDate(data.dueDate);
    } catch (err: any) {
      console.error("Receipt parse error:", err);
      setParseError(
        err?.message || "Could not parse receipt. You can fill it manually."
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-300">
            Bills &amp; Subscriptions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload a receipt or invoice and let the agent pre-fill the bill.
          </p>
          {isParsing && (
            <p className="text-[11px] text-emerald-400 mt-1">
              Reading receipt with Claude…
            </p>
          )}
          {parseError && (
            <p className="text-[11px] text-amber-400 mt-1">
              {parseError}
            </p>
          )}
        </div>
      </div>

      {/* Add bill form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 md:grid-cols-5 md:items-end border border-slate-800 rounded-xl p-3 bg-slate-950/40"
      >
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400 block mb-1">
            Vendor *
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
            placeholder="AWS, Figma, OpenAI..."
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Category
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
            placeholder="Infra, Design, AI..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Amount (USD) *
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Due date *
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400 block mb-1">
            Receipt / Invoice (image)
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-xs text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-xs file:text-slate-100 hover:file:bg-slate-600"
            onChange={handleReceiptChange}
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400 transition disabled:opacity-60"
            disabled={isParsing}
          >
            {isParsing ? "Parsing…" : "Add bill"}
          </button>
        </div>
      </form>

      {/* Bills table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wide">
              <th className="py-2 text-left">Vendor</th>
              <th className="py-2 text-left">Category</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2 text-left">Due</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Receipt</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 && (
              <tr>
                <td
                  className="py-4 text-xs text-slate-500"
                  colSpan={7}
                >
                  No bills yet. Add one using the form above.
                </td>
              </tr>
            )}
            {bills.map((bill) => (
              <tr
                key={bill.id}
                className="border-b border-slate-900 last:border-none hover:bg-slate-900/80"
              >
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const logo = getVendorLogoFromText(bill.vendor, bill.category);
                      return logo ? (
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          className="w-6 h-6 rounded object-contain"
                        />
                      ) : null;
                    })()}
                    <span className="font-medium text-slate-100">
                      {bill.vendor}
                    </span>
                  </div>
                </td>
                <td className="py-2 pr-4 text-slate-300">
                  {bill.category}
                </td>
                <td className="py-2 pr-4 text-right text-slate-100">
                  ${bill.amount.toFixed(2)}
                </td>
                <td className="py-2 pr-4 text-slate-300">
                  {bill.dueDate}
                </td>
                <td className="py-2 pr-4">
                  <span className={statusBadge(bill.status)}>
                    {bill.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs">
                  {bill.receiptUrl ? (
                    <a
                      href={bill.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      {bill.receiptName ?? "View"}
                    </a>
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </td>
                <td className="py-2 text-right space-x-2">
                  <button
                    className="rounded-lg border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 transition"
                    onClick={() => onMarkPaid(bill.id)}
                  >
                    Mark paid
                  </button>
                  <button
                    className="rounded-lg border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 transition"
                    onClick={() => onMarkDeferred(bill.id)}
                  >
                    Defer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

