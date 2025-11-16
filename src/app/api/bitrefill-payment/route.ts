import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { join } from "path";

export const runtime = "nodejs";

const LOCUS_AGENT_URL = process.env.LOCUS_AGENT_URL || "http://localhost:3001";

interface BitrefillRequest {
  checkoutUrl: string;
  amazonEmail?: string;
  amazonPassword?: string;
  emailTo?: string;
}

function runPythonScript(action: string, checkoutUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(process.cwd(), "scripts", "bitrefill_payment_flow.py");
    const pythonCommand = process.env.PYTHON_COMMAND || "python3";

    const args = [scriptPath, action, checkoutUrl];
    
    const env = {
      ...process.env,
      HEADLESS: "false", // Show browser for demo
    };
    
    const pythonProcess = spawn(pythonCommand, args, {
      cwd: process.cwd(),
      env,
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Python script output: ${stdout}\nStderr: ${stderr}`
          )
        );
      }
    });

    pythonProcess.on("error", (error) => {
      reject(
        new Error(
          `Failed to start Python process: ${error.message}. Make sure Python 3 and selenium are installed.`
        )
      );
    });
  });
}

async function payWithLocus(paymentAddress: string, amount: number = 5): Promise<any> {
  try {
    const prompt = `Please pay ${amount} USDC to this cryptocurrency address: ${paymentAddress}. This is for a Bitrefill gift card purchase. Use the Locus send_to_address tool to send the payment.`;

    const response = await fetch(`${LOCUS_AGENT_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      // Check if the error is about budget
      const errorText = JSON.stringify(data).toLowerCase();
      const isBudgetError = errorText.includes("budget") || 
                           errorText.includes("insufficient") || 
                           errorText.includes("policy violation") ||
                           errorText.includes("$0") ||
                           errorText.includes("remaining: $0");
      
      let errorMessage = data.error || "Failed to process payment with Locus";
      
      if (isBudgetError) {
        errorMessage = `Payment failed due to budget constraints. Your Locus account shows insufficient funds. Please check your Locus dashboard to increase your budget. Current error: ${data.error || "Policy Violation"}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        details: data.details || data,
        isBudgetError,
      };
    }

    // Check if result indicates budget issue
    const resultText = JSON.stringify(data.result || "").toLowerCase();
    if (resultText.includes("budget") && resultText.includes("$0")) {
      return {
        success: false,
        error: "Payment failed: Your Locus account budget is insufficient. Please increase your budget in the Locus dashboard.",
        details: data.result,
        isBudgetError: true,
      };
    }

    return {
      success: true,
      result: data.result,
      mcpStatus: data.mcpStatus,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Error calling Locus agent",
      details: error?.stack,
    };
  }
}

async function waitForPaymentConfirmation(
  checkoutUrl: string,
  maxWaitMinutes: number = 10
): Promise<any> {
  return new Promise((resolve) => {
    const scriptPath = join(process.cwd(), "scripts", "bitrefill_payment_flow.py");
    const pythonCommand = process.env.PYTHON_COMMAND || "python3";

    const env = {
      ...process.env,
      HEADLESS: "false",
      MAX_WAIT_MINUTES: maxWaitMinutes.toString(),
    };

    const pythonProcess = spawn(pythonCommand, [scriptPath, "wait_for_code", checkoutUrl], {
      cwd: process.cwd(),
      env,
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
      // Log progress to console
      console.log("Bitrefill status:", data.toString().trim());
    });

    pythonProcess.on("close", (code) => {
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error: "Failed to parse result",
          message: `Stdout: ${stdout}\nStderr: ${stderr}`,
        });
      }
    });

    pythonProcess.on("error", (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`,
      });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: BitrefillRequest = await req.json();
    const { checkoutUrl, amazonEmail, amazonPassword, emailTo } = body;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Checkout URL is required" },
        { status: 400 }
      );
    }

    console.log("Step 1: Scraping payment address from Bitrefill...");
    
    // Step 1: Scrape payment address
    const addressResult = await runPythonScript("scrape_address", checkoutUrl);
    
    if (!addressResult.success || !addressResult.payment_address) {
      return NextResponse.json(
        {
          success: false,
          error: addressResult.error || "Failed to scrape payment address",
          message: addressResult.message,
          step: "scrape_address",
        },
        { status: 400 }
      );
    }

    const paymentAddress = addressResult.payment_address;
    console.log(`Step 2: Payment address found: ${paymentAddress}`);

    // Step 2: Pay with Locus
    console.log("Step 2: Initiating payment with Locus...");
    const paymentResult = await payWithLocus(paymentAddress, 5);
    
    if (!paymentResult.success) {
      // Provide more helpful error message for budget issues
      let errorMessage = paymentResult.error || "Failed to initiate payment with Locus";
      
      if (paymentResult.isBudgetError) {
        errorMessage = `❌ Payment failed: Your Locus account budget is insufficient. The logs show you have $0 remaining out of $10 USDC budget. Please go to your Locus dashboard and increase your budget to at least $5 USDC (or your desired amount). The budget is configured in your Locus account settings, not in this code.`;
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: paymentResult.details,
          step: "locus_payment",
          payment_address: paymentAddress,
          isBudgetError: paymentResult.isBudgetError,
        },
        { status: 400 }
      );
    }

    console.log("Step 3: Payment initiated. Waiting for confirmation...");

    // Step 3: Wait for payment confirmation and get gift card code
    const codeResult = await waitForPaymentConfirmation(checkoutUrl, 10);
    
    if (!codeResult.success || !codeResult.gift_card_code) {
      return NextResponse.json(
        {
          success: false,
          error: codeResult.error || "Failed to get gift card code",
          message: codeResult.message,
          step: "wait_for_code",
          payment_address: paymentAddress,
          payment_initiated: true,
        },
        { status: 400 }
      );
    }

    const giftCardCode = codeResult.gift_card_code;
    console.log(`Step 4: Gift card code obtained: ${giftCardCode}`);

    // Step 4: Redeem on Amazon
    console.log("Step 4: Redeeming gift card on Amazon...");
    
    // Call the redeem endpoint internally
    const redeemUrl = req.nextUrl.origin + "/api/redeem-gift-card";
    
    const redeemResponse = await fetch(redeemUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        giftCardCode: giftCardCode,
        vendor: "Amazon Gift Card (via Bitrefill)",
        category: "Gift Card",
        emailTo,
        amazonEmail,
        amazonPassword,
      }),
    });

    const redeemData = await redeemResponse.json();

    if (!redeemResponse.ok || !redeemData.success) {
      return NextResponse.json(
        {
          success: false,
          error: redeemData.error || "Failed to redeem gift card on Amazon",
          step: "amazon_redemption",
          gift_card_code: giftCardCode,
          payment_address: paymentAddress,
        },
        { status: 400 }
      );
    }

    // Success!
    return NextResponse.json({
      success: true,
      payment_address: paymentAddress,
      gift_card_code: giftCardCode,
      amazon_redemption: redeemData,
      message: "Complete flow successful: Bitrefill payment → Gift card code → Amazon redemption",
    });
  } catch (error: any) {
    console.error("Error in bitrefill-payment API:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
        details: error?.stack,
      },
      { status: 500 }
    );
  }
}

