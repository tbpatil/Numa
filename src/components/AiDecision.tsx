import type { Bill } from "@/components/BillsTable";

export type PlanTier = "enterprise" | "pro" | "basic" | "team" | "individual" | "unknown";
export type InvoiceType = "infrastructure" | "api" | "saas" | "workspace" | "food" | "other";
export type PaymentRecommendation = "approve" | "review" | "defer" | "reject";

export type AiDecisionResult = {
  toPay: Bill[];
  toDefer: Bill[];
  toReview: Bill[]; // Needs human confirmation
  explanation: string;
  comparisonNotes?: string[];
  totalSelected: number;
  remainingBudget: number;
};

/**
 * Detect plan tier from vendor and invoice details
 */
function detectPlanTier(bill: Bill): PlanTier {
  const vendorLower = bill.vendor.toLowerCase();
  const categoryLower = (bill.category || "").toLowerCase();
  const combined = `${vendorLower} ${categoryLower}`;

  // Enterprise indicators
  if (
    combined.match(/enterprise|business|enterprise plan|business plan/) ||
    bill.amount > 500
  ) {
    return "enterprise";
  }

  // Pro indicators
  if (
    combined.match(/pro|professional|team seats|team plan|pro plan/) ||
    (bill.amount > 50 && bill.amount <= 500)
  ) {
    return "pro";
  }

  // Team indicators
  if (combined.match(/team|team seats/)) {
    return "team";
  }

  // Individual/Basic
  if (combined.match(/individual|starter|basic|free/)) {
    return "individual";
  }

  return "unknown";
}

/**
 * Classify invoice type based on vendor and category
 */
function classifyInvoiceType(bill: Bill): InvoiceType {
  const vendorLower = bill.vendor.toLowerCase();
  const categoryLower = (bill.category || "").toLowerCase();
  const combined = `${vendorLower} ${categoryLower}`;

  // Infrastructure (critical - keeps company running)
  if (
    combined.match(
      /aws|azure|gcp|cloud|vercel|hosting|infrastructure|infra|database|db|server|compute|storage|cdn|domain|ssl/
    )
  ) {
    return "infrastructure";
  }

  // API costs (critical for product functionality)
  if (
    combined.match(
      /api|openai|anthropic|claude|gpt|azure openai|api key|api usage|tokens|model|llm|ai service/
    )
  ) {
    return "api";
  }

  // SaaS tools (productivity, can be evaluated)
  if (
    combined.match(
      /github|gitlab|linear|jira|figma|slack|notion|confluence|asana|trello|zoom|productivity|saas|tool/
    )
  ) {
    return "saas";
  }

  // Workspace (can defer if not critical)
  if (
    combined.match(/wework|office|workspace|desk|rent|office space|co-working/)
  ) {
    return "workspace";
  }

  // Food & social (lowest priority)
  if (
    combined.match(/lunch|food|restaurant|catering|dinner|swag|merch|party|offsite|team building|social/)
  ) {
    return "food";
  }

  return "other";
}

/**
 * Calculate priority score based on multiple factors
 */
function calculatePriority(bill: Bill): {
  score: number;
  breakdown: {
    basePriority: number;
    urgency: number;
    criticality: number;
    planBonus: number;
  };
} {
  const invoiceType = classifyInvoiceType(bill);
  const planTier = detectPlanTier(bill);

  // Base priority by invoice type (critical for company survival)
  let basePriority = 50; // default mid-priority
  switch (invoiceType) {
    case "infrastructure":
      basePriority = 100; // Keep servers running - CRITICAL
      break;
    case "api":
      basePriority = 95; // API costs - very critical for product
      break;
    case "saas":
      basePriority = 70; // Productivity tools - important but can be optimized
      break;
    case "workspace":
      basePriority = 60; // Workspace - nice to have, can defer
      break;
    case "food":
      basePriority = 20; // Team lunch - lowest priority
      break;
    case "other":
      basePriority = 50;
      break;
  }

  // Urgency boost based on due date
  let urgency = 0;
  if (bill.dueDate) {
    const now = new Date();
    const due = new Date(bill.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (Number.isNaN(diffDays)) {
      urgency = 0;
    } else if (diffDays <= 0) {
      urgency = 40; // Overdue or due today
    } else if (diffDays <= 2) {
      urgency = 30; // Due in 2 days
    } else if (diffDays <= 7) {
      urgency = 20; // Due in a week
    } else if (diffDays <= 14) {
      urgency = 10; // Due in 2 weeks
    } else {
      urgency = 0;
    }
  }

  // Criticality boost - larger amounts get slight priority if critical
  let criticality = 0;
  if (invoiceType === "infrastructure" || invoiceType === "api") {
    // Critical services get bonus for being critical
    criticality = 15;
  } else if (invoiceType === "food") {
    // Food gets negative score if high amount
    if (bill.amount > 50) {
      criticality = -10; // Expensive team lunch can be deferred
    }
  }

  // Plan tier bonus - enterprise/pro plans are more likely to be essential
  let planBonus = 0;
  switch (planTier) {
    case "enterprise":
      planBonus = 20; // Enterprise plans usually essential
      break;
    case "pro":
      planBonus = 10;
      break;
    case "team":
      planBonus = 5;
      break;
    case "individual":
      planBonus = -5; // Might be able to downgrade
      break;
  }

  const totalScore = basePriority + urgency + criticality + planBonus;

  return {
    score: Math.max(0, totalScore), // Ensure non-negative
    breakdown: {
      basePriority,
      urgency,
      criticality,
      planBonus,
    },
  };
}

/**
 * Compare bills and generate comparison notes
 */
function compareBills(bills: Bill[]): string[] {
  const notes: string[] = [];
  const byType = new Map<InvoiceType, Bill[]>();

  bills.forEach((bill) => {
    const type = classifyInvoiceType(bill);
    if (!byType.has(type)) {
      byType.set(type, []);
    }
    byType.get(type)!.push(bill);
  });

  // Check for high API costs
  const apiBills = byType.get("api") || [];
  const apiTotal = apiBills.reduce((sum, b) => sum + b.amount, 0);
  if (apiTotal > 200) {
    notes.push(
      `⚠️ High API costs detected: $${apiTotal.toFixed(2)}. Consider usage optimization.`
    );
  }

  // Check for multiple infrastructure bills
  const infraBills = byType.get("infrastructure") || [];
  if (infraBills.length > 3) {
    notes.push(
      `📊 Multiple infrastructure bills (${infraBills.length}). Review for consolidation opportunities.`
    );
  }

  // Check for expensive food vs critical services
  const foodBills = byType.get("food") || [];
  const foodTotal = foodBills.reduce((sum, b) => sum + b.amount, 0);
  const criticalTotal =
    (byType.get("infrastructure") || []).reduce((sum, b) => sum + b.amount, 0) +
    (byType.get("api") || []).reduce((sum, b) => sum + b.amount, 0);

  if (foodTotal > criticalTotal * 0.2 && foodTotal > 50) {
    notes.push(
      `🍽️ Team expenses ($${foodTotal.toFixed(2)}) are significant compared to critical services. Consider deferring non-essential team events.`
    );
  }

  // Check for plan upgrades
  const enterpriseBills = bills.filter((b) => detectPlanTier(b) === "enterprise");
  if (enterpriseBills.length > 0 && enterpriseBills.reduce((sum, b) => sum + b.amount, 0) > 500) {
    notes.push(
      `💼 Enterprise plans detected. Confirm these are essential for operations before approval.`
    );
  }

  return notes;
}

/**
 * Determine if a bill needs human review
 */
function needsReview(bill: Bill, budget: number, totalPending: number): boolean {
  const invoiceType = classifyInvoiceType(bill);
  const planTier = detectPlanTier(bill);

  // Large amounts always need review
  if (bill.amount > budget * 0.5) {
    return true;
  }

  // Enterprise plans should be confirmed
  if (planTier === "enterprise" && bill.amount > 100) {
    return true;
  }

  // High-cost food needs review
  if (invoiceType === "food" && bill.amount > 100) {
    return true;
  }

  // If bill is a large portion of remaining budget
  if (totalPending > 0 && bill.amount > budget / totalPending * 2) {
    return true;
  }

  return false;
}

/**
 * Main decision function - enhanced with comparison and review logic
 */
export function decideBills(
  allBills: Bill[],
  budget: number
): AiDecisionResult {
  // Work only on pending bills
  const pending = allBills.filter((b) => b.status === "pending");

  if (pending.length === 0) {
    return {
      toPay: [],
      toDefer: [],
      toReview: [],
      explanation: "No pending bills to evaluate.",
      totalSelected: 0,
      remainingBudget: budget,
    };
  }

  // Calculate priority scores for all pending bills
  const scored = pending.map((bill) => {
    const priority = calculatePriority(bill);
    return {
      bill,
      score: priority.score,
      breakdown: priority.breakdown,
      invoiceType: classifyInvoiceType(bill),
      planTier: detectPlanTier(bill),
      needsReview: needsReview(bill, budget, pending.length),
    };
  });

  // Sort by score (highest first), then by amount (cheaper first for same priority)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.bill.amount - b.bill.amount;
  });

  // Generate comparison notes
  const comparisonNotes = compareBills(pending);

  // Allocate budget
  let remaining = budget;
  const toPay: Bill[] = [];
  const toDefer: Bill[] = [];
  const toReview: Bill[] = [];

  for (const item of scored) {
    // If bill needs review, add to review list (but don't auto-pay)
    if (item.needsReview) {
      toReview.push(item.bill);
      continue;
    }

    // Try to fit in budget
    if (item.bill.amount <= remaining) {
      toPay.push(item.bill);
      remaining -= item.bill.amount;
    } else {
      toDefer.push(item.bill);
    }
  }

  const totalSelected = toPay.reduce((sum, b) => sum + b.amount, 0);

  // Build explanation
  const explanationLines: string[] = [];

  explanationLines.push(
    `Agent had a budget of $${budget.toFixed(2)} and allocated $${totalSelected.toFixed(
      2
    )} to payments, leaving $${remaining.toFixed(2)} unspent.`
  );

  if (toPay.length > 0) {
    const byType = new Map<InvoiceType, Bill[]>();
    toPay.forEach((b) => {
      const type = classifyInvoiceType(b);
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type)!.push(b);
    });

    explanationLines.push(`\n✅ APPROVED (${toPay.length} bills):`);
    
    // Group by type for clearer explanation
    byType.forEach((bills, type) => {
      const typeTotal = bills.reduce((sum, b) => sum + b.amount, 0);
      explanationLines.push(
        `  ${type.toUpperCase()}: $${typeTotal.toFixed(2)} - ${bills.map(b => `${b.vendor} ($${b.amount})`).join(", ")}`
      );
    });
  }

  if (toReview.length > 0) {
    explanationLines.push(`\n⚠️ REQUIRES REVIEW (${toReview.length} bills):`);
    toReview.forEach((bill) => {
      const type = classifyInvoiceType(bill);
      const planTier = detectPlanTier(bill);
      explanationLines.push(
        `  ${bill.vendor}: $${bill.amount.toFixed(2)} (${type}, ${planTier} plan) - Confirm before payment`
      );
    });
  }

  if (toDefer.length > 0) {
    explanationLines.push(`\n⏸️ DEFERRED (${toDefer.length} bills):`);
    toDefer.forEach((bill) => {
      const type = classifyInvoiceType(bill);
      explanationLines.push(
        `  ${bill.vendor}: $${bill.amount.toFixed(2)} (${type}) - Lower priority or budget exceeded`
      );
    });
  }

  return {
    toPay,
    toDefer,
    toReview,
    explanation: explanationLines.join("\n"),
    comparisonNotes: comparisonNotes.length > 0 ? comparisonNotes : undefined,
    totalSelected,
    remainingBudget: remaining,
  };
}
