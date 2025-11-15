import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const LOCUS_AGENT_URL = process.env.LOCUS_AGENT_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    const response = await fetch(`${LOCUS_AGENT_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json().catch(() => ({}));

    // Check if the response indicates an error (even if HTTP status is 200)
    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          error: data.error || "Failed to process prompt with Locus agent",
          details: data.details || data,
          status: response.status,
        },
        { status: response.ok ? 500 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      result: data.result,
      mcpStatus: data.mcpStatus,
    });
  } catch (error: any) {
    console.error("Error calling Locus agent:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
        details: error?.stack,
      },
      { status: 500 }
    );
  }
}

