import { NextResponse } from "next/server";
import { z } from "zod";

const waitlistSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100),
  website: z
    .string()
    .min(1, "Website is required")
    .refine(
      (val) => {
        try {
          const url = val.startsWith("http") ? val : `https://${val}`;
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid website URL" },
    ),
  teamSize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"], {
    error: "Team size is required",
  }),
  country: z.string().min(1, "Country is required"),
  monthlyPayrollVolume: z.enum(
    ["under-50k", "50k-250k", "250k-1m", "1m-5m", "5m-20m", "20m+"],
    { error: "Monthly payroll volume is required" },
  ),
  currentPayrollProvider: z
    .string()
    .min(1, "Current payroll provider is required")
    .max(100),
  email: z.string().email("Please enter a valid email address"),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;

async function addToMailchimp(data: WaitlistFormData) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = process.env.MAILCHIMP_DC; // e.g. "us21"

  if (!apiKey || !listId || !dc) {
    throw new Error("Mailchimp environment variables are not configured");
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const body = {
    email_address: data.email,
    status: "subscribed",
    merge_fields: {
      //   FNAME: data.companyName,
      COMPANY: data.companyName,
      WEBSITE: data.website,
      TEAMSIZE: data.teamSize,
      COUNTRY: data.country,
      PAYROLLVOL: data.monthlyPayrollVolume,
      CURPROVDR: data.currentPayrollProvider,
    },
    tags: ["waitlist"],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `apikey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  // Mailchimp returns 400 if member already exists
  if (!response.ok) {
    if (json.title === "Member Exists") {
      // Treat as success — they're already on the list
      return { alreadyExists: true };
    }
    throw new Error(json.detail || "Failed to add to Mailchimp");
  }

  return { alreadyExists: false };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 422 },
      );
    }

    const result = await addToMailchimp(parsed.data);

    if (result.alreadyExists) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: "You're already on the waitlist! We'll be in touch soon.",
      });
    }

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      message: "You've been added to the waitlist! We'll be in touch soon.",
    });
  } catch (error) {
    console.error("[Waitlist API Error]", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
