import { NextResponse } from "next/server";
import { z } from "zod";

const hireTalentSchema = z.object({
  roleTitle: z.string().min(1, "Role title is required").max(100),
  roleType: z.enum(["full-time", "part-time", "contract", "internship"], {
    error: "Role type is required",
  }),
  seniority: z.enum(
    [
      "intern",
      "junior",
      "mid",
      "senior",
      "lead",
      "manager",
      "director",
      "vp",
      "c-suite",
    ],
    { error: "Seniority is required" },
  ),
  workArrangement: z.enum(["remote", "hybrid", "onsite"], {
    error: "Work arrangement is required",
  }),
  expectedStartDate: z
    .string()
    .min(1, "Expected start date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid date",
    }),
  salaryRange: z.enum(
    [
      "under-1k",
      "1k-2k",
      "2k-4k",
      "4k-7k",
      "7k-12k",
      "12k-20k",
      "20k+",
      "flexible",
    ],
    { error: "Salary range is required" },
  ),
  preferredLocation: z
    .string()
    .min(1, "Preferred location is required")
    .max(100),
  workerType: z.string().min(1, "Worker type is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  companyName: z.string().min(1, "Company name is required").max(100),
});

export type HireTalentFormData = z.infer<typeof hireTalentSchema>;

async function addToMailchimp(data: HireTalentFormData) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = process.env.MAILCHIMP_DC;

  if (!apiKey || !listId || !dc) {
    throw new Error("Mailchimp environment variables are not configured");
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const body = {
    email_address: data.email,
    status: "subscribed",
    merge_fields: {
      COMPANY: data.companyName,
      ROLETITLE: data.roleTitle,
      ROLETYPE: data.roleType,
      SENIORITY: data.seniority,
      WORKARRANG: data.workArrangement,
      STARTDATE: data.expectedStartDate,
      SALARYRANG: data.salaryRange,
      PREFLOC: data.preferredLocation,
      WORKERTYPE: data.workerType,
    },
    tags: ["hire-talent"],
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

  if (!response.ok) {
    if (json.title === "Member Exists") {
      // Update the existing member's merge fields and add the tag
      const patchUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${encodeURIComponent(
        data.email.toLowerCase(),
      )}`;

      await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          Authorization: `apikey ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merge_fields: body.merge_fields,
          tags: ["hire-talent"],
        }),
      });

      return { alreadyExists: true };
    }
    throw new Error(json.detail || "Failed to add to Mailchimp");
  }

  return { alreadyExists: false };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = hireTalentSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 422 },
      );
    }

    const result = await addToMailchimp(parsed.data);

    return NextResponse.json({
      success: true,
      alreadyExists: result.alreadyExists,
      message: result.alreadyExists
        ? "We already have your details. We'll be in touch soon!"
        : "Request submitted! We'll reach out to schedule your call.",
    });
  } catch (error) {
    console.error("[Hire Talent API Error]", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
