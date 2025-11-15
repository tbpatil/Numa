import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const supportedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!file.type || !supportedImageTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}. Please upload an image (JPEG, PNG, GIF, or WebP).` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" =
      "image/png";
    const fileTypeLower = file.type.toLowerCase();
    if (fileTypeLower.includes("jpeg") || fileTypeLower.includes("jpg")) {
      mediaType = "image/jpeg";
    } else if (fileTypeLower.includes("png")) {
      mediaType = "image/png";
    } else if (fileTypeLower.includes("gif")) {
      mediaType = "image/gif";
    } else if (fileTypeLower.includes("webp")) {
      mediaType = "image/webp";
    }

    const systemPrompt = `
You are a receipt and invoice parser for a finance agent.
Extract ONLY these fields from the uploaded image:

- vendor: the name of the company or person being paid.
- amount: the total amount due in USD (number).
- dueDate: ISO date string if a due date is clearly mentioned (YYYY-MM-DD). If not present, approximate based on "invoice date" + 30 days.
- category: short category like "Infra", "Design", "AI", "SaaS", "Travel", etc.

IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanations, no extra text.
Start directly with { and end with }. Example: {"vendor":"ACME Corp","amount":123.45,"dueDate":"2025-11-20","category":"Infra"}
`;

    const userPrompt = `Parse this receipt or invoice image and return ONLY valid JSON starting with { and ending with }.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const textContent = msg.content.find(
      (c) => c.type === "text"
    ) as { type: "text"; text: string } | undefined;

    if (!textContent) {
      return NextResponse.json(
        { error: "Claude did not return text content" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(textContent.text);
    } catch (err) {
      let jsonText = textContent.text.trim();
      jsonText = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      jsonText = jsonText.trim();
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse extracted JSON:", jsonMatch[0]);
          console.error("Original Claude response:", textContent.text);
          return NextResponse.json(
            { 
              error: "Failed to parse Claude response as JSON", 
              raw: textContent.text.substring(0, 200) 
            },
            { status: 500 }
          );
        }
      } else {
        console.error("Failed to parse Claude JSON:", textContent.text);
        return NextResponse.json(
          { 
            error: "Failed to parse Claude response as JSON", 
            raw: textContent.text.substring(0, 200) 
          },
          { status: 500 }
        );
      }
    }

    const { vendor, amount, dueDate, category } = parsed;

    return NextResponse.json({
      vendor: vendor ?? "",
      amount: typeof amount === "number" ? amount : Number(amount) || 0,
      dueDate: dueDate ?? "",
      category: category ?? "",
    });
  } catch (error: any) {
    console.error("Error in /api/parse-receipt:", error);
    
    if (error?.error) {
      const apiError = error.error;
      return NextResponse.json(
        { error: apiError.message || "Anthropic API error" },
        { status: error.status || 500 }
      );
    }
    
    const errorMessage =
      error?.message || error?.error?.message || "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
